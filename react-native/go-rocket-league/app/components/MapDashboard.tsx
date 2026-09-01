import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiConfig } from '@/lib/api/config';
import { useUserStore } from '@/store/userStore';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getAppLanguage, t } from '@/i18n';
import { colors } from '@/theme';

const SCAN_BUTTON_SIZE = 48;
const SCAN_BUTTON_RADIUS = 16;
const PROGRESS_BAR_HEIGHT = 4;
const PROGRESS_BAR_RADIUS = 2;
const FUEL_WARNING_HEIGHT = 2;

const DIFFICULTY_COLORS: Record<MapDashboardProps['difficulty'], string> = {
  Easy: colors.difficultyEasy,
  Medium: colors.difficultyMedium,
  Hard: colors.difficultyHard,
  Expert: colors.difficultyExpert,
};

export type MapDashboardProps = {
  region: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  cardsDiscovered: number;
  totalCards: number;
  fuel: number;
  flagsOwned: number;
  ownedAreaKm2: number;
  /** Quantidade de usuários na área (mesma célula/sala). */
  nearmeCount: number;
  /** Quantidade de células (h3RoomCell) já visitadas — progresso de exploração. */
  coverageCount: number;
  distanceKm: number;
  /** Modo explorador ativo (zoom >= threshold): cartas, jogadores, eventos; coverage só conta quando ativo. */
  explorerModeActive: boolean;
  isScanning: boolean;
  /** Change to re-run entrance animation (e.g. screen focus key) */
  focusKey?: number;
};

export function MapDashboard({
  region,
  difficulty,
  cardsDiscovered,
  totalCards,
  fuel,
  flagsOwned,
  ownedAreaKm2,
  nearmeCount,
  coverageCount,
  distanceKm,
  explorerModeActive,
  isScanning,
  focusKey,
}: MapDashboardProps) {
  const avatarId = useUserStore((s) => s.avatarId);
  const avatarUri =
    avatarId != null
      ? `${apiConfig.baseUrl}/public_assets/avatars/${avatarId}.webp`
      : null;

  const [trackWidth, setTrackWidth] = useState(0);
  const progressPercentage = totalCards > 0 ? (cardsDiscovered / totalCards) * 100 : 0;
  const fillWidth = (trackWidth * progressPercentage) / 100;

  const progressWidth = useSharedValue(0);
  const scanScale = useSharedValue(1);
  const radarRotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(0.8);
  const fuelWarningOpacity = useSharedValue(0.5);
  const entrance = useSharedValue(0);
  /** Progresso 0→1 do shimmer que percorre a borda (loop). */
  const shimmerProgress = useSharedValue(0);
  const containerWidthSv = useSharedValue(400);

  useEffect(() => {
    if (explorerModeActive) {
      shimmerProgress.value = 0;
      shimmerProgress.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        true
      );
    } else {
      shimmerProgress.value = withTiming(0, { duration: 200 });
    }
  }, [explorerModeActive]);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withDelay(
      300,
      withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })
    );
  }, [focusKey]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 24 }],
  }));

  useEffect(() => {
    progressWidth.value = withTiming(fillWidth, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  }, [fillWidth]);

  useEffect(() => {
    if (isScanning) {
      radarRotation.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      radarRotation.value = withTiming(0, { duration: 200 });
    }
  }, [isScanning]);

  useEffect(() => {
    if (fuel >= 10 && !isScanning) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(0.8, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(0, { duration: 200 });
      pulseScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [fuel, isScanning]);

  useEffect(() => {
    if (fuel < 25) {
      fuelWarningOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      fuelWarningOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [fuel]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const scanButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanScale.value }],
  }));

  const radarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${radarRotation.value * 360}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const fuelWarningStyle = useAnimatedStyle(() => ({
    opacity: fuelWarningOpacity.value,
  }));

  const SHIMMER_STRIP_WIDTH = 12;
  const shimmerStripStyle = useAnimatedStyle(() => {
    'worklet';
    const w = containerWidthSv.value;
    const x = -SHIMMER_STRIP_WIDTH + (w + SHIMMER_STRIP_WIDTH) * shimmerProgress.value;
    return { transform: [{ translateX: x }] };
  });

  const setContainerWidth = useCallback((w: number) => {
    containerWidthSv.value = w;
  }, []);

  const language = getAppLanguage();
  const isEnglish = language.startsWith('en');

  return (
    <Animated.View
      style={[styles.container, entranceStyle]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.regionRow}>
            <IconSymbol
              name="map-marker"
              size={14}
              color={colors.primaryLight}
              style={styles.regionIcon}
            />
            <Text style={styles.regionText} numberOfLines={1}>
              {region}
            </Text>
            <Text
              style={[styles.difficultyText, { color: DIFFICULTY_COLORS[difficulty] }]}
            >
              {t(`map.difficulty.${difficulty}`)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <IconSymbol name="account-group-outline" size={12} color={colors.primaryLight} />
              <Text style={styles.statText}>{t('map.nearme')}: {nearmeCount}</Text>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="map-outline" size={12} color={colors.secondaryLight} />
              <Text style={styles.statText}>{t('map.coverage')}: {coverageCount}</Text>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="walk" size={12} color={colors.secondaryLight} />
              <Text style={styles.statText}>{distanceKm.toFixed(2)} km </Text>
              {/* {isEnglish ? (
                <Text style={styles.statText}>{(distanceKm/1.60934).toFixed(2)} mi</Text> )
                : (
                <Text style={styles.statText}>{distanceKm.toFixed(2)} km </Text>
                )}: */}
            </View>
          </View>
          <View style={[styles.statsRow, styles.statsRowSecond]}>
            <View style={styles.stat}>
              <IconSymbol name="flag" size={12} color={colors.destructive} />
              <Text style={styles.statText}>{flagsOwned}</Text>
            </View>
            <View style={styles.stat}>
              <IconSymbol name="map-outline" size={12} color={colors.successLight} />
              <Text style={styles.statText}>{ownedAreaKm2.toFixed(2)} km²</Text>
            </View>
            <View style={styles.stat}>
              <IconSymbol
                name="compass"
                size={12}
                color={explorerModeActive ? colors.successLight : colors.textMuted}
              />
              <Text style={styles.statText}>{t('map.explorerLabel')}:</Text>
              <View
                style={[
                  styles.explorerBadge,
                  explorerModeActive ? styles.explorerBadgeOn : styles.explorerBadgeOff,
                ]}
              >
                <Text
                  style={[
                    styles.explorerBadgeText,
                    explorerModeActive ? styles.explorerBadgeTextOn : styles.explorerBadgeTextOff,
                  ]}
                >
                  {explorerModeActive ? t('map.explorerOn') : t('map.explorerOff')}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={styles.progressTrack}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.progressFillWrap, progressFillStyle]}>
              {trackWidth > 0 && fillWidth > 0 && (
                <Canvas
                  style={[
                    styles.progressFillCanvas,
                    { width: Math.max(1, fillWidth), height: PROGRESS_BAR_HEIGHT },
                  ]}
                >
                  <RoundedRect
                    x={0}
                    y={0}
                    width={Math.max(1, fillWidth)}
                    height={PROGRESS_BAR_HEIGHT}
                    r={PROGRESS_BAR_RADIUS}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(Math.max(1, fillWidth), 0)}
                      colors={[
                        colors.secondaryGradientStart,
                        colors.primaryGradientStart,
                        colors.primaryGradientEnd,
                      ]}
                      positions={[0, 0.5, 1]}
                    />
                  </RoundedRect>
                </Canvas>
              )}
            </Animated.View>
          </View>
        </View>

        <View
        >
          {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={[styles.avatarImage]}
                  contentFit="cover"
                />
              ):(
                <IconSymbol name="account-circle-outline" size={40} color={colors.text} />
              )}
        </View>
      </View>

      {fuel < 25 && (
        <Animated.View style={[styles.fuelWarning, fuelWarningStyle]} />
      )}

      {/* Shimmer na borda quando modo explorador ativo */}
      {explorerModeActive && (
        <View style={styles.shimmerOverlay} pointerEvents="none">
          <Animated.View style={[styles.shimmerStripWrap, shimmerStripStyle]}>
            <Canvas style={styles.shimmerStripCanvas}>
              <RoundedRect x={0} y={0} width={SHIMMER_STRIP_WIDTH} height={2000} r={0}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(SHIMMER_STRIP_WIDTH, 0)}
                  colors={[
                    'transparent',
                    colors.dashboardScanGlow,
                    'transparent',
                  ]}
                  positions={[0, 0.5, 1]}
                />
              </RoundedRect>
            </Canvas>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.hudCardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.dashboardBorder,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  regionIcon: {
    flexShrink: 0,
  },
  regionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsRowSecond: {
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  explorerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  explorerBadgeOn: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  explorerBadgeOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  explorerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  explorerBadgeTextOn: {
    color: colors.successLight,
  },
  explorerBadgeTextOff: {
    color: colors.textMuted,
  },
  progressTrack: {
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: colors.dashboardProgressTrack,
    borderRadius: PROGRESS_BAR_RADIUS,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFillWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: PROGRESS_BAR_HEIGHT,
    overflow: 'hidden',
    borderRadius: PROGRESS_BAR_RADIUS,
  },
  progressFillCanvas: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  scanButton: {
    width: SCAN_BUTTON_SIZE,
    height: SCAN_BUTTON_SIZE,
    borderRadius: SCAN_BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanButtonDisabled: {},
  scanButtonDisabledBg: {
    backgroundColor: colors.dashboardScanButtonDisabled,
    borderRadius: SCAN_BUTTON_RADIUS,
  },
  scanPressed: {
    opacity: 0.9,
  },
  pulseOverlay: {
    backgroundColor: colors.primaryLight,
    opacity: 0.2,
    borderRadius: SCAN_BUTTON_RADIUS,
  },
  radarIconWrap: {
    width: SCAN_BUTTON_SIZE,
    height: SCAN_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarImageDisabled: {
    opacity: 0.5,
  },
  fuelWarning: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FUEL_WARNING_HEIGHT,
    backgroundColor: colors.destructive,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 0,
    opacity: 0.3,
  },
  shimmerStripWrap: {
    position: 'absolute',
    left: 0,
    top: -500,
    width: 100,
    height: 2000,
  },
  shimmerStripCanvas: {
    width: 100,
    height: 2000,
  },
});
