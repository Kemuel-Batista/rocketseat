import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';
import { t } from '@/i18n';
import type { FuelRuntimeState } from '@/store/userStore';

const BAR_HEIGHT = 8;
const BAR_RADIUS = BAR_HEIGHT / 2;
const SHIMMER_BAND_WIDTH = 80;
const SHIMMER_DURATION_MS = 1500;

const ENTRANCE_OFFSET = 20;

interface FuelIndicatorProps {
  /** Fuel percentage 0–100 (default 78) */
  fuel?: number;
  /** Estado de recarga vindo do UserState do Colyseus. */
  fuelRecharge?: FuelRuntimeState | null;
  /** Change to re-run entrance animation (e.g. screen focus key) */
  focusKey?: number;
}

export function FuelIndicator({ fuel = 78, fuelRecharge = null, focusKey }: FuelIndicatorProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [displayFuel, setDisplayFuel] = useState(fuel);
  const anchorFuelRef = useRef(fuel);
  const anchorAtMsRef = useRef(Date.now());

  // Sempre que chegar fuel/metadata, atualiza âncora.
  // Se ciclo de recarga estiver ativo e fuel estiver zerado, usamos lastRefillAt como origem
  // para considerar tempo offline (app fechado/background).
  useEffect(() => {
    if (fuelRecharge?.refillActive && fuel <= 0) {
      anchorFuelRef.current = 0;
      anchorAtMsRef.current = fuelRecharge.lastRefillAt;
    } else {
      anchorFuelRef.current = fuel;
      anchorAtMsRef.current = Date.now();
    }
    setDisplayFuel(fuel);
  }, [fuel, fuelRecharge]);

  useEffect(() => {
    if (!fuelRecharge?.refillActive) return;

    const computeFuel = () => {
      const maxFuel = Math.max(0, fuelRecharge.maxFuel);
      const interval = Math.max(1, fuelRecharge.refillInterval);
      const baseGranted = Math.max(0, fuelRecharge.refillGranted);
      const elapsedMs = Math.max(0, Date.now() - fuelRecharge.lastFuelUpdateAt);
      const grantRatePerMs = maxFuel / interval;
      const grantedNow = Math.min(maxFuel, baseGranted + elapsedMs * grantRatePerMs);
      const additionalGranted = Math.max(0, grantedNow - baseGranted);
      // Interpola a partir do último valor do servidor, limitado ao saldo
      // de recarga disponível no ciclo atual.
      const nextFuel = Math.min(maxFuel, Math.max(0, fuel) + additionalGranted);
      setDisplayFuel(nextFuel);
    };

    computeFuel();
    const timer = setInterval(computeFuel, 250);
    return () => clearInterval(timer);
  }, [fuelRecharge, fuel]);

  const fillWidth = Math.max(0, (trackWidth * Math.min(100, Math.max(0, displayFuel))) / 100);

  const fillWidthSv = useSharedValue(0);
  const shimmerX = useSharedValue(-SHIMMER_BAND_WIDTH);
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withDelay(
      100,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })
    );
  }, [focusKey]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (entrance.value - 1) * ENTRANCE_OFFSET }],
  }));

  useEffect(() => {
    fillWidthSv.value = withTiming(fillWidth, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [fillWidth]);

  useEffect(() => {
    if (trackWidth <= 0) return;
    shimmerX.value = -SHIMMER_BAND_WIDTH;
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(trackWidth + SHIMMER_BAND_WIDTH, {
          duration: SHIMMER_DURATION_MS,
          easing: Easing.linear,
        }),
        withTiming(-SHIMMER_BAND_WIDTH, { duration: 0 })
      ),
      -1,
      false
    );
  }, [trackWidth]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: fillWidthSv.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <Animated.View style={[styles.container, entranceStyle]}>
      <View style={styles.row}>
        <Ionicons
          name="rocket"
          size={16}
          color={colors.primaryLight}
          style={styles.icon}
        />
        <Text style={styles.label}>{t('map.fuelLabel').toUpperCase()}</Text>
        <Text style={styles.percent}>{displayFuel.toFixed(2)}%</Text>
      </View>
      <View
        style={styles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[styles.fillWrap, fillAnimatedStyle]}
          pointerEvents="none"
        >
          {fillWidth > 0 && (
            <Canvas
              style={[
                styles.fillCanvas,
                { width: fillWidth, height: BAR_HEIGHT },
              ]}
            >
              <RoundedRect
                x={0}
                y={0}
                width={fillWidth}
                height={BAR_HEIGHT}
                r={BAR_RADIUS}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(fillWidth, 0)}
                  colors={[
                    colors.primaryGradientStart,
                    colors.primaryGradientEnd,
                  ]}
                />
              </RoundedRect>
            </Canvas>
          )}
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
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.hudCardBackground,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.hudCardBorderPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
    textTransform: 'uppercase',
  },
  percent: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  track: {
    height: BAR_HEIGHT,
    backgroundColor: colors.progressTrack,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    position: 'relative',
  },
  fillWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: BAR_HEIGHT,
    overflow: 'hidden',
    borderRadius: BAR_RADIUS,
  },
  fillCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shimmerWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
