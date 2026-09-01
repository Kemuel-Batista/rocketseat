import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 10;
const ROW_HEIGHT = THUMB_SIZE + 12;

export type FuelCoinSpendSliderProps = {
  min: number;
  max: number;
  value: number;
  onValueChange: (coins: number) => void;
  disabled?: boolean;
};

/**
 * Slider de moedas (passo 1): Gesture Handler + Reanimated + trilha com gradiente Skia.
 */
export function FuelCoinSpendSlider({
  min,
  max,
  value,
  onValueChange,
  disabled = false,
}: FuelCoinSpendSliderProps) {
  const layoutW = useSharedValue(0);
  const [canvasW, setCanvasW] = useState(0);
  const progress = useSharedValue(0);
  const panStartProgress = useSharedValue(0);
  const [fillW, setFillW] = useState(0);
  /** Evita que `useEffect` reescreva `progress` a cada `value` durante o arraste (causaria jitter no thumb). */
  const draggingRef = useRef(false);

  const usable = useDerivedValue(() => Math.max(1, layoutW.value - THUMB_SIZE));

  const beginDrag = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const emitLiveCoins = useCallback(
    (coins: number) => {
      onValueChange(coins);
    },
    [onValueChange]
  );

  const finishDrag = useCallback(
    (coins: number) => {
      draggingRef.current = false;
      onValueChange(coins);
    },
    [onValueChange]
  );

  useEffect(() => {
    if (draggingRef.current) return;
    if (max <= min) {
      progress.value = 0;
      return;
    }
    progress.value = (value - min) / (max - min);
  }, [min, max, value, progress]);

  useAnimatedReaction(
    () => progress.value * usable.value,
    (w) => {
      runOnJS(setFillW)(Math.max(0, w));
    }
  );

  const pan = Gesture.Pan()
    .enabled(!disabled && max > min)
    .activeOffsetX([-12, 12])
    .onBegin(() => {
      runOnJS(beginDrag)();
      panStartProgress.value = progress.value;
    })
    .onUpdate((e) => {
      const u = usable.value;
      const delta = u > 0 ? e.translationX / u : 0;
      progress.value = Math.min(1, Math.max(0, panStartProgress.value + delta));
      const range = max - min;
      if (range <= 0) return;
      let coins = min + Math.round(progress.value * range);
      coins = Math.max(min, Math.min(max, coins));
      runOnJS(emitLiveCoins)(coins);
    })
    .onEnd(() => {
      const range = max - min;
      let coins = min + Math.round(progress.value * range);
      coins = Math.max(min, Math.min(max, coins));
      const snapped = range > 0 ? (coins - min) / range : 0;
      progress.value = snapped;
      runOnJS(finishDrag)(coins);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * usable.value }],
  }));

  if (max <= min) {
    return null;
  }

  return (
    <View
      style={[styles.wrap, disabled && styles.disabled]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        layoutW.value = w;
        setCanvasW(w);
      }}>
      <GestureDetector gesture={pan}>
        <Animated.View style={styles.touchArea}>
          {canvasW > 0 ? (
            <Canvas style={{ width: canvasW, height: ROW_HEIGHT }} pointerEvents="none">
              <RoundedRect
                x={0}
                y={(ROW_HEIGHT - TRACK_HEIGHT) / 2}
                width={canvasW}
                height={TRACK_HEIGHT}
                r={5}
                color="rgba(30, 41, 59, 0.95)"
              />
              {fillW > 0 ? (
                <RoundedRect
                  x={0}
                  y={(ROW_HEIGHT - TRACK_HEIGHT) / 2}
                  width={Math.min(fillW, canvasW)}
                  height={TRACK_HEIGHT}
                  r={5}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(Math.max(Math.min(fillW, canvasW), 1), 0)}
                    colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                  />
                </RoundedRect>
              ) : null}
            </Canvas>
          ) : null}

          <Animated.View style={[styles.thumb, thumbStyle]} pointerEvents="none">
            <View style={styles.thumbInner} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  touchArea: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: (ROW_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE - 4,
    height: THUMB_SIZE - 4,
    borderRadius: (THUMB_SIZE - 4) / 2,
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
  },
});
