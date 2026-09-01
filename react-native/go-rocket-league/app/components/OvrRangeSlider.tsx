import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
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
const OVR_MIN = 0;
const OVR_MAX = 100;

export type OvrRangeSliderProps = {
  ovrMin: number;
  ovrMax: number;
  onChange: (next: { ovrMin: number; ovrMax: number }) => void;
  disabled?: boolean;
};

type FillBounds = { x: number; w: number };

function clampFillToCanvas(bounds: FillBounds, canvasW: number): FillBounds {
  const x = Math.max(0, bounds.x);
  const w = Math.max(0, Math.min(bounds.w, canvasW - x));
  return { x, w };
}

/**
 * Faixa de overall (0–100): um único trilho com dois thumbs (mesmo padrão visual do FuelCoinSpendSlider).
 */
export function OvrRangeSlider({ ovrMin, ovrMax, onChange, disabled = false }: OvrRangeSliderProps) {
  const layoutW = useSharedValue(0);
  const [canvasW, setCanvasW] = useState(0);
  const progressLow = useSharedValue(0);
  const progressHigh = useSharedValue(1);
  const panStartLow = useSharedValue(0);
  const panStartHigh = useSharedValue(1);
  const dragging = useSharedValue<0 | 1 | 2>(0);
  const [fillBounds, setFillBounds] = useState<FillBounds>({ x: 0, w: 0 });
  const [displayMin, setDisplayMin] = useState(ovrMin);
  const [displayMax, setDisplayMax] = useState(ovrMax);

  const usable = useDerivedValue(() => Math.max(1, layoutW.value - THUMB_SIZE));

  useEffect(() => {
    progressLow.value = ovrMin / OVR_MAX;
    progressHigh.value = ovrMax / OVR_MAX;
  }, [ovrMin, ovrMax, progressLow, progressHigh]);

  useEffect(() => {
    setDisplayMin(ovrMin);
    setDisplayMax(ovrMax);
  }, [ovrMin, ovrMax]);

  const setDisplayPair = useCallback((min: number, max: number) => {
    setDisplayMin(min);
    setDisplayMax(max);
  }, []);

  const commitRange = useCallback(
    (lo: number, hi: number) => {
      onChange({ ovrMin: lo, ovrMax: hi });
    },
    [onChange]
  );

  useAnimatedReaction(
    () => {
      const u = usable.value;
      const lx = progressLow.value * u;
      const hx = progressHigh.value * u;
      /** Preenchimento de centro-a-centro dos thumbs evita “vazar” ciano à esquerda do thumb esquerdo. */
      const fillX = lx + THUMB_SIZE / 2;
      const fillW = Math.max(0, hx - lx);
      return { fillX, fillW };
    },
    (v) => {
      runOnJS(setFillBounds)({ x: v.fillX, w: v.fillW });
    }
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-10, 10])
    .onBegin((e) => {
      const u = usable.value;
      const lowX = progressLow.value * u;
      const highX = progressHigh.value * u;
      const x = e.x;
      const centerLow = lowX + THUMB_SIZE / 2;
      const centerHigh = highX + THUMB_SIZE / 2;
      const distLow = Math.abs(x - centerLow);
      const distHigh = Math.abs(x - centerHigh);
      dragging.value = distLow <= distHigh ? 1 : 2;
      panStartLow.value = progressLow.value;
      panStartHigh.value = progressHigh.value;
    })
    .onUpdate((e) => {
      const u = usable.value;
      if (u <= 0) return;
      const delta = e.translationX / u;
      if (dragging.value === 1) {
        let nl = panStartLow.value + delta;
        nl = Math.max(0, Math.min(progressHigh.value, nl));
        progressLow.value = nl;
      } else {
        let nh = panStartHigh.value + delta;
        nh = Math.min(1, Math.max(progressLow.value, nh));
        progressHigh.value = nh;
      }
      const lo = Math.round(progressLow.value * OVR_MAX);
      const hi = Math.round(progressHigh.value * OVR_MAX);
      runOnJS(setDisplayPair)(lo, hi);
    })
    .onEnd(() => {
      dragging.value = 0;
      let lo = Math.round(progressLow.value * OVR_MAX);
      let hi = Math.round(progressHigh.value * OVR_MAX);
      lo = Math.max(OVR_MIN, Math.min(OVR_MAX, lo));
      hi = Math.max(OVR_MIN, Math.min(OVR_MAX, hi));
      if (lo > hi) {
        const t = lo;
        lo = hi;
        hi = t;
      }
      progressLow.value = lo / OVR_MAX;
      progressHigh.value = hi / OVR_MAX;
      runOnJS(commitRange)(lo, hi);
    });

  const lowThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressLow.value * usable.value }],
  }));

  const highThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressHigh.value * usable.value }],
  }));

  const fillOnCanvas =
    canvasW > 0 ? clampFillToCanvas(fillBounds, canvasW) : fillBounds;

  return (
    <View style={styles.outer}>
      <View style={styles.rangeSummaryRow}>
        <TextInput
          editable={false}
          pointerEvents="none"
          showSoftInputOnFocus={false}
          caretHidden
          underlineColorAndroid="transparent"
          value=""
          placeholder={String(displayMin)}
          placeholderTextColor={colors.text}
          style={styles.rangeInput}
        />
        <Text style={styles.rangeDash}> – </Text>
        <TextInput
          editable={false}
          pointerEvents="none"
          showSoftInputOnFocus={false}
          caretHidden
          underlineColorAndroid="transparent"
          value=""
          placeholder={String(displayMax)}
          placeholderTextColor={colors.text}
          style={styles.rangeInput}
        />
      </View>
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
                {fillOnCanvas.w > 0 ? (
                  <RoundedRect
                    x={fillOnCanvas.x}
                    y={(ROW_HEIGHT - TRACK_HEIGHT) / 2}
                    width={fillOnCanvas.w}
                    height={TRACK_HEIGHT}
                    r={5}>
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(Math.max(fillOnCanvas.w, 1), 0)}
                      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
                    />
                  </RoundedRect>
                ) : null}
              </Canvas>
            ) : null}

            <Animated.View style={[styles.thumb, lowThumbStyle]} pointerEvents="none">
              <View style={styles.thumbInner} />
            </Animated.View>
            <Animated.View style={[styles.thumb, highThumbStyle]} pointerEvents="none">
              <View style={styles.thumbInner} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    gap: 4,
  },
  rangeSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  rangeInput: {
    minWidth: 40,
    paddingVertical: 0,
    paddingHorizontal: 4,
    fontSize: 15,
    fontWeight: '700',
    color: 'transparent',
    textAlign: 'center',
    borderWidth: 0,
    includeFontPadding: false,
  },
  rangeDash: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
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
