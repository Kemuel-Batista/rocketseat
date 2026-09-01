import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const BAR_HEIGHT = 8;
const BAR_RADIUS = 4;
const SHIMMER_BAND_WIDTH = 80;
const SHIMMER_DURATION_MS = 1500;

export interface CardFoundProgressProps {
  foundCount: number;
  totalCount: number;
  onPress?: () => void;
}

export function CardFoundProgress({
  foundCount,
  totalCount,
  onPress,
}: CardFoundProgressProps) {
  const [width, setWidth] = useState(0);
  const progress = totalCount > 0 ? Math.min(1, foundCount / totalCount) : 0;
  const fillWidth = width * progress;
  const percentage = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

  const countText = useMemo(
    () =>
      t('cards.foundLabel', {
        foundFormatted: foundCount.toLocaleString(),
        totalFormatted: totalCount.toLocaleString(),
      }),
    [foundCount, totalCount]
  );

  const percentText = useMemo(
    () =>
      t('cardDetails.foundPercent', {
        percentFormatted: percentage.toFixed(1),
      }),
    [percentage]
  );

  const shimmerX = useSharedValue(-SHIMMER_BAND_WIDTH);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setWidth(w);
  };

  useEffect(() => {
    if (width <= 0) return;
    shimmerX.value = -SHIMMER_BAND_WIDTH;
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(width + SHIMMER_BAND_WIDTH, {
          duration: SHIMMER_DURATION_MS,
          easing: Easing.linear,
        }),
        withTiming(-SHIMMER_BAND_WIDTH, { duration: 0 })
      ),
      -1,
      false
    );
  }, [width]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
      accessibilityLabel={t('cardDetails.viewFoundInstances')}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="layers" size={24} color={colors.primaryLight} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {t('cardDetails.globalDiscoveryTitle').toUpperCase()}
          </Text>
          <Text style={styles.count}>{countText}</Text>
        </View>

        <View style={styles.barTrack} onLayout={onLayout}>
          {width > 0 && fillWidth > 0 && (
            <View
              style={[
                styles.fillWrap,
                { width: fillWidth, height: BAR_HEIGHT },
              ]}
              pointerEvents="none"
            >
              <Canvas style={{ width: fillWidth, height: BAR_HEIGHT }}>
                <RoundedRect
                  x={0}
                  y={0}
                  width={fillWidth}
                  height={BAR_HEIGHT}
                  r={BAR_RADIUS}
                >
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(width, 0)}
                    colors={[
                      palette.purple[500],
                      colors.primary,
                      palette.blue[500],
                    ]}
                  />
                </RoundedRect>
              </Canvas>
              <Animated.View
                style={[
                  styles.shimmerWrap,
                  shimmerAnimatedStyle,
                  { width: SHIMMER_BAND_WIDTH, height: BAR_HEIGHT },
                ]}
                pointerEvents="none"
              >
                <Canvas
                  style={{ width: SHIMMER_BAND_WIDTH, height: BAR_HEIGHT }}
                >
                  <RoundedRect
                    x={0}
                    y={0}
                    width={SHIMMER_BAND_WIDTH}
                    height={BAR_HEIGHT}
                    r={BAR_RADIUS}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(SHIMMER_BAND_WIDTH, 0)}
                      colors={[
                        'transparent',
                        colors.shimmerOverlay,
                        'transparent',
                      ]}
                      positions={[0, 0.5, 1]}
                    />
                  </RoundedRect>
                </Canvas>
              </Animated.View>
            </View>
          )}
        </View>

        <Text style={styles.percent}>{percentText}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  containerPressed: {
    opacity: 0.95,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  barTrack: {
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  fillWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
    borderRadius: BAR_RADIUS,
  },
  shimmerWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  percent: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
    marginTop: 6,
  },
});
