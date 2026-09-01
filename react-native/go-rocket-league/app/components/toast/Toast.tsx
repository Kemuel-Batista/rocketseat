import { Canvas, Group, Skia, Skottie, useClock } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { colors } from "@/theme";
import type { ToastItem, ToastType } from "./types";

const spaceAnimationJson = require("@/assets/animations/Space.json");
const spaceAnimation = Skia.Skottie.Make(JSON.stringify(spaceAnimationJson));

const DEFAULT_ICONS: Record<ToastType, IconSymbolName> = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert",
  info: "information",
  reward: "trophy",
  system: "cog",
};

const DEFAULT_DURATION = 5000;

const SWIPE_RIGHT_THRESHOLD = 80;
const SWIPE_UP_THRESHOLD = 60;
const EXIT_OFFSCREEN = 500;

/** Space.json é 1920x1080 – usamos para cobrir toda a área do toast (cover). */
const SKOTTIE_ASPECT = 1920 / 1080;

function SkottieToastBackground({
  width,
  height,
  marginLeft,
  marginTop,
}: {
  width: number;
  height: number;
  marginLeft: number;
  marginTop: number;
}) {
  const clock = useClock();
  const frame = useDerivedValue(() => {
    if (!spaceAnimation) return 0;
    const fps = spaceAnimation.fps();
    const duration = spaceAnimation.duration();
    const totalFrames = duration * fps;
    const currentFrame = Math.floor((clock.value / 1000) * fps) % Math.max(1, totalFrames);
    return currentFrame;
  });

  if (!spaceAnimation) return null;

  const scale = width / 1920;

  return (
    <View style={[StyleSheet.absoluteFill, styles.skottieWrap]} pointerEvents="none">
      <View style={{ width, height, marginLeft, marginTop }}>
        <Canvas style={{ width, height }}>
          <Group transform={[{ scale }]}>
            <Skottie animation={spaceAnimation} frame={frame} />
          </Group>
        </Canvas>
      </View>
    </View>
  );
}

export function Toast({
  id,
  type = "info",
  title,
  message,
  icon,
  duration = DEFAULT_DURATION,
  route,
  actionLabel,
  onPress,
  haptic = true,
  dismissible = true,
  progressBar = true,
  onClose,
}: ToastItem) {
  const router = useRouter();
  const config = colors.toast[type];
  const iconName = (icon as IconSymbolName) ?? DEFAULT_ICONS[type];

  const progress = useSharedValue(100);
  const trackWidth = useSharedValue(0);
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  const [cardLayout, setCardLayout] = useState({ width: 0, height: 0 });

  const onCardLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCardLayout((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const onProgressTrackLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  }, [trackWidth]);

  /** Cor de fundo do toast com 50% de opacidade para o Skottie aparecer atrás */
  const toastBgOpacity = config.bg + "80";

  const triggerHaptic = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [haptic]);

  useEffect(() => {
    triggerHaptic();
  }, [triggerHaptic]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  }, [opacity, translateY, scale]);

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      progress.value = remaining;
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [duration, onClose, progress]);

  const handleAction = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (route) {
      router.push({
        pathname: route.name as any,
        params: (route.params ?? undefined) as Record<string, string> | undefined,
      });
    }
    onPress?.();
    onClose();
  }, [haptic, route, onPress, onClose, router]);

  const handleDismiss = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  }, [haptic, onClose]);

  const panGesture = React.useMemo(() => {
    if (!dismissible) return Gesture.Pan().enabled(false);
    return Gesture.Pan()
      .onUpdate((e) => {
        panX.value = e.translationX;
        panY.value = e.translationY;
      })
      .onEnd((e) => {
        const dx = panX.value;
        const dy = panY.value;
        const dismissRight = dx > SWIPE_RIGHT_THRESHOLD;
        const dismissUp = dy < -SWIPE_UP_THRESHOLD;
        if (dismissRight || dismissUp) {
          opacity.value = withTiming(0, { duration: 180 });
          if (dismissRight) {
            panX.value = withTiming(EXIT_OFFSCREEN, { duration: 200 }, (finished) => {
              if (finished) runOnJS(handleDismiss)();
            });
            panY.value = withTiming(0, { duration: 200 });
          } else {
            panY.value = withTiming(-EXIT_OFFSCREEN, { duration: 200 }, (finished) => {
              if (finished) runOnJS(handleDismiss)();
            });
            panX.value = withTiming(0, { duration: 200 });
          }
        } else {
          panX.value = withSpring(0, { damping: 20, stiffness: 300 });
          panY.value = withSpring(0, { damping: 20, stiffness: 300 });
        }
      });
  }, [dismissible, handleDismiss, opacity, panX, panY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: panX.value },
      { translateY: translateY.value + panY.value },
      { scale: scale.value },
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const w = trackWidth.value * (progress.value / 100);
    return { width: w };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.wrapper, containerAnimatedStyle]}>
        <View
          style={[styles.card, { borderColor: config.border }]}
          onLayout={onCardLayout}
        >
        {cardLayout.width > 0 && cardLayout.height > 0 && (() => {
          const cardW = cardLayout.width;
          const cardH = cardLayout.height;
          const cardAspect = cardW / cardH;
          let skottieW: number;
          let skottieH: number;
          if (cardAspect > SKOTTIE_ASPECT) {
            skottieW = cardW;
            skottieH = cardW / SKOTTIE_ASPECT;
          } else {
            skottieH = cardH;
            skottieW = cardH * SKOTTIE_ASPECT;
          }
          return (
          <>
            {/* 1. Skottie (fundo) – tamanho cover + overflow hidden */}
            <SkottieToastBackground
              width={skottieW}
              height={skottieH}
              marginLeft={(cardW - skottieW) / 2}
              marginTop={(cardH - skottieH) / 2}
            />
            {/* 2. Overlay: cor do toast com 50% de opacidade */}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: toastBgOpacity },
              ]}
            />
          </>
          );
        })()}
        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
            <IconSymbol name={iconName} size={22} color={config.primary} />
          </View>
          <View style={styles.content}>
            {title ? (
              <Text style={[styles.title, { color: colors.toast.textTitle }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            <Text style={[styles.message, { color: colors.toast.textMessage }]} numberOfLines={3}>
              {message}
            </Text>
            {(actionLabel || route) && (
              <Pressable
                onPress={handleAction}
                style={[styles.actionButton, { backgroundColor: config.primary }]}
                android_ripple={{ color: colors.toast.actionRipple }}
              >
                <Text style={styles.actionLabel}>
                  {actionLabel ?? "Ver"}
                </Text>
              </Pressable>
            )}
          </View>
          {dismissible && (
            <Pressable
              onPress={handleDismiss}
              style={styles.closeButton}
              hitSlop={12}
              android_ripple={{ color: colors.toast.closeRipple }}
            >
              <IconSymbol name="close" size={18} color={colors.toast.closeIcon} />
            </Pressable>
          )}
        </View>
        {progressBar && (
          <View style={styles.progressTrack} onLayout={onProgressTrackLayout}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: config.primary },
                progressAnimatedStyle,
              ]}
            />
          </View>
        )}
      </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  skottieWrap: {
    overflow: "hidden",
    borderRadius: 16,
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    paddingRight: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.toast.actionLabel,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.toast.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
  },
});
