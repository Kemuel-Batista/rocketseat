import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  Canvas,
  Circle,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';

import { t } from '@/i18n';
import type { FuelRuntimeState } from '@/store/userStore';
import { colors, palette } from '@/theme';

type FuelCenterBand = 'high' | 'mid' | 'low';

function centerBandFromPercent(percent: number): FuelCenterBand {
  if (percent > 40) return 'high';
  if (percent > 25) return 'mid';
  return 'low';
}

const CENTER_STYLES: Record<
  FuelCenterBand,
  { gradient: [string, string]; ring: string; icon: string }
> = {
  high: {
    gradient: ['rgba(30, 64, 175, 0.94)', 'rgba(15, 23, 42, 0.98)'],
    ring: 'rgba(96, 165, 250, 0.42)',
    icon: palette.blue[400],
  },
  mid: {
    gradient: ['rgba(146, 64, 14, 0.92)', 'rgba(55, 32, 8, 0.96)'],
    ring: 'rgba(251, 191, 36, 0.48)',
    icon: palette.amber[400],
  },
  low: {
    gradient: ['rgba(127, 29, 29, 0.94)', 'rgba(45, 12, 12, 0.97)'],
    ring: 'rgba(248, 113, 113, 0.45)',
    icon: palette.red[400],
  },
};

const SIZE = 90;
const STROKE = 10;
const TRACK_START = 135;
const TRACK_SWEEP = 270;
const INNER_SIZE = 60;
const ENTRANCE_OFFSET = 20;

interface FuelIndicatorCircularProps {
  fuel?: number;
  /** Capacidade do tanque (estado da sala / runtime). Default 100. */
  maxFuel?: number;
  fuelRecharge?: FuelRuntimeState | null;
  focusKey?: number;
  onPress?: () => void;
  pressDisabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function FuelIndicatorCircular({
  fuel = 78,
  maxFuel: maxFuelProp = 100,
  fuelRecharge = null,
  focusKey,
  onPress,
  pressDisabled = false,
  accessibilityLabel,
  accessibilityHint,
}: FuelIndicatorCircularProps) {
  const [displayFuel, setDisplayFuel] = useState(fuel);
  const [shinePhase, setShinePhase] = useState(0);
  const entrance = useSharedValue(0);
  const iconPulse = useSharedValue(0);
  const hintPulse = useSharedValue(0);

  useEffect(() => {
    setDisplayFuel(fuel);
  }, [fuel]);

  useEffect(() => {
    if (!fuelRecharge?.refillActive) return;

    const computeFuel = () => {
      const maxFuel = Math.max(0, fuelRecharge?.maxFuel ?? maxFuelProp);
      const interval = Math.max(1, fuelRecharge.refillInterval);
      const baseGranted = Math.max(0, fuelRecharge.refillGranted);
      const elapsedMs = Math.max(0, Date.now() - fuelRecharge.lastFuelUpdateAt);
      const grantRatePerMs = maxFuel / interval;
      const grantedNow = Math.min(maxFuel, baseGranted + elapsedMs * grantRatePerMs);
      const additionalGranted = Math.max(0, grantedNow - baseGranted);
      const nextFuel = Math.min(maxFuel, Math.max(0, fuel) + additionalGranted);
      setDisplayFuel(nextFuel);
    };

    computeFuel();
    const timer = setInterval(computeFuel, 250);
    return () => clearInterval(timer);
  }, [fuelRecharge, fuel, maxFuelProp]);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withDelay(
      100,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
    );
  }, [focusKey, entrance]);

  useEffect(() => {
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [iconPulse]);

  const tankCap = Math.max(1, fuelRecharge?.maxFuel ?? maxFuelProp);
  const percent = Math.min(100, Math.max(0, (displayFuel / tankCap) * 100));
  const showZeroRefuelHint = Boolean(onPress && !pressDisabled && percent < 0.5);

  useEffect(() => {
    if (!showZeroRefuelHint) {
      cancelAnimation(hintPulse);
      hintPulse.value = 0;
      return;
    }
    hintPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 880, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 880, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [showZeroRefuelHint, hintPulse]);

  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame = (frame + 1) % 180;
      setShinePhase(frame / 180);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  const progressSweep = (TRACK_SWEEP * percent) / 100;
  const centerBand = centerBandFromPercent(percent);
  const centerStyle = CENTER_STYLES[centerBand];
  const center = SIZE / 2;
  const radius = center - STROKE / 2 - 2;
  const arcRect = useMemo(
    () => Skia.XYWHRect(center - radius, center - radius, radius * 2, radius * 2),
    [center, radius]
  );
  const trackPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(arcRect, TRACK_START, TRACK_SWEEP);
    return p;
  }, [arcRect]);
  const progressPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addArc(arcRect, TRACK_START, progressSweep);
    return p;
  }, [arcRect, progressSweep]);
  const innerLevelMarkers = useMemo(() => {
    const markers: Array<{ path: ReturnType<typeof Skia.Path.Make>; major: boolean }> = [];
    const totalMarkers = 12;
    const innerRadius = INNER_SIZE / 2;
    for (let i = 0; i <= totalMarkers; i += 1) {
      const major = i % 3 === 0;
      const angle = (TRACK_START + (TRACK_SWEEP * i) / totalMarkers) * (Math.PI / 180);
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const startRadius = innerRadius + 1;
      const endRadius = startRadius + (major ? 6 : 3);
      const p = Skia.Path.Make();
      p.moveTo(center + ux * startRadius, center + uy * startRadius);
      p.lineTo(center + ux * endRadius, center + uy * endRadius);
      markers.push({ path: p, major });
    }
    return markers;
  }, [center]);
  const shineWindow = useMemo(() => {
    if (progressSweep <= 0) {
      return { segmentSweep: 0, startOffset: 0 };
    }
    const segmentSweep = Math.max(16, Math.min(28, progressSweep * 0.22));
    const maxStartOffset = Math.max(0, progressSweep - segmentSweep);
    const startOffset = maxStartOffset * shinePhase;
    return { segmentSweep, startOffset };
  }, [progressSweep, shinePhase]);
  const shineSegments = useMemo(() => {
    if (progressSweep <= 0 || shineWindow.segmentSweep <= 0) return [];
    const layers = 8;
    const visibleStart = TRACK_START;
    const visibleEnd = TRACK_START + progressSweep;
    const phaseStart = TRACK_START + shinePhase * 360;
    const segments: Array<{
      path: ReturnType<typeof Skia.Path.Make>;
      alpha: number;
      width: number;
    }> = [];
    for (let i = 0; i < layers; i += 1) {
      const t = i / (layers - 1);
      const tailOffset = t * shineWindow.segmentSweep * 0.9;
      const segSweep = shineWindow.segmentSweep * (1 - t * 0.75);
      if (segSweep <= 0.4) continue;
      const rawSegStart = phaseStart - tailOffset;
      const p = Skia.Path.Make();
      // O brilho gira 360, mas só desenha a interseção com o trecho preenchido.
      for (const shift of [-360, 0, 360]) {
        const segStart = rawSegStart + shift;
        const segEnd = segStart + segSweep;
        const overlapStart = Math.max(segStart, visibleStart);
        const overlapEnd = Math.min(segEnd, visibleEnd);
        if (overlapEnd > overlapStart) {
          p.addArc(arcRect, overlapStart, overlapEnd - overlapStart);
        }
      }
      segments.push({
        path: p,
        alpha: 0.42 * (1 - t),
        width: STROKE + 3 - t * 2.2,
      });
    }
    return segments;
  }, [arcRect, progressSweep, shineWindow, shinePhase]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (entrance.value - 1) * ENTRANCE_OFFSET }],
  }));

  const iconPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + iconPulse.value * 0.07 }],
  }));

  const zeroHintStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + hintPulse.value * 0.28,
  }));

  const gaugeBody = (
    <>
      <Canvas style={styles.canvas}>
          <Circle cx={center} cy={center} r={INNER_SIZE / 2}>
            <LinearGradient
              start={vec(center, center - INNER_SIZE / 2)}
              end={vec(center, center + INNER_SIZE / 2)}
              colors={centerStyle.gradient}
            />
          </Circle>
          <Circle
            cx={center}
            cy={center}
            r={INNER_SIZE / 2}
            style="stroke"
            strokeWidth={1.2}
            color={centerStyle.ring}
          />

          <Path
            path={trackPath}
            style="stroke"
            strokeWidth={STROKE}
            color={colors.progressTrack}
            strokeCap="round"
          />
          {innerLevelMarkers.map((marker, idx) => (
            <Path
              key={`fuel-inner-level-marker-${idx}`}
              path={marker.path}
              style="stroke"
              strokeWidth={marker.major ? 2 : 1.2}
              color={marker.major ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.5)'}
              strokeCap="round"
            />
          ))}
          <Path
            path={progressPath}
            style="stroke"
            strokeWidth={STROKE}
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SIZE, SIZE)}
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            />
          </Path>
          {shineSegments.map((segment, idx) => (
            <Path
              key={`fuel-shine-segment-${idx}`}
              path={segment.path}
              style="stroke"
              strokeWidth={segment.width}
              strokeCap="round"
              color={colors.shimmerHighlight}
              opacity={segment.alpha}
            />
          ))}
      </Canvas>

      <View style={styles.innerDisc}>
        <Animated.View style={iconPulseStyle}>
          <Ionicons name="flash" size={24} color={centerStyle.icon} />
        </Animated.View>
        <Text style={styles.percentText}>{percent.toFixed(0)}%</Text>
      </View>
    </>
  );

  const zeroHint = showZeroRefuelHint ? (
    <Animated.Text style={[styles.zeroHint, zeroHintStyle]} numberOfLines={2}>
      {t('map.fuelGaugeZeroHint')}
    </Animated.Text>
  ) : null;

  return (
    <Animated.View style={[styles.container, entranceStyle]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          disabled={pressDisabled}
          style={({ pressed }) => [
            styles.tapColumn,
            pressed && !pressDisabled && styles.gaugePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: pressDisabled }}
        >
          <View style={styles.gaugeWrap}>{gaugeBody}</View>
          {zeroHint}
        </Pressable>
      ) : (
        <View style={styles.tapColumn}>
          <View style={styles.gaugeWrap}>{gaugeBody}</View>
          {zeroHint}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 200,
  },
  gaugeWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePressed: {
    opacity: 0.88,
  },
  zeroHint: {
    marginTop: 6,
    paddingHorizontal: 6,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: colors.primaryLight,
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
  innerDisc: {
    position: 'absolute',
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  percentText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});

