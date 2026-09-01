import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import { apiConfig } from '@/lib/api/config';
import type { CellFlagState } from '@/lib/colyseus/types';
import { colors } from '@/theme';

const SELF_RADAR_SIZE = Math.round(48);
/** Diâmetro da foto do avatar no mapa (referência para outros marcadores, ex. moeda). */
export const SELF_MAP_AVATAR_SIZE = Math.round(32);
const SELF_AVATAR_SIZE = SELF_MAP_AVATAR_SIZE;
const SELF_MARKER_CONTAINER = Math.ceil(SELF_RADAR_SIZE * 1.7);
const SELF_RADAR_CYCLE_MS = 3000;
const SELF_RADAR_PHASE = 1 / 3;
const AVATAR_BORDER_WIDTH = 2;
const AVATAR_OUTER_SIZE = SELF_AVATAR_SIZE + AVATAR_BORDER_WIDTH * 2;

const FLAG_RADAR_DOT_SIZE = 6;
const FLAG_RADAR_RADIUS = SELF_AVATAR_SIZE / 2;

type SelfAvatarMarkerProps = {
  avatarId: number | null;
  mapCenter: { lat: number; lng: number };
  roomState: { flag: CellFlagState | null };
  radarEnabled?: boolean;
};

export function SelfAvatarMarker({
  avatarId,
  mapCenter,
  roomState,
  radarEnabled = true,
}: SelfAvatarMarkerProps) {
  const selfRadarProgress = useSharedValue(0);
  const radarAngleDeg = useSharedValue(-90);

  useEffect(() => {
    selfRadarProgress.value = withRepeat(
      withTiming(1, { duration: SELF_RADAR_CYCLE_MS, easing: Easing.linear }),
      -1,
      false
    );
  }, [selfRadarProgress]);

  // Ponto tangente da borda do avatar na direção da bandeira.
  // A bolinha percorre o menor arco (sem teleporte).
  useEffect(() => {
    const flag = roomState.flag;
    if (!radarEnabled || !flag || flag.isCaptured) return;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const lat1 = toRad(mapCenter.lat);
    const lat2 = toRad(flag.lat);
    const dLng = toRad(flag.lng - mapCenter.lng);

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const bearingRad = Math.atan2(y, x);
    let bearingDeg = (bearingRad * 180) / Math.PI;
    if (bearingDeg < 0) bearingDeg += 360;

    // Bearing em tela: 0=norte (cima) -> -90 no círculo unitário.
    const target = bearingDeg - 90;
    const current = radarAngleDeg.value;
    const delta = ((target - current + 540) % 360) - 180; // menor arco [-180,180]
    const next = current + delta;

    radarAngleDeg.value = withTiming(next, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [roomState.flag, mapCenter, radarEnabled, radarAngleDeg]);

  const selfWave1Style = useAnimatedStyle(() => {
    const t = selfRadarProgress.value;
    return { transform: [{ scale: 0.6 + t }], opacity: 0.28 * (1 - t) };
  });
  const selfWave2Style = useAnimatedStyle(() => {
    const t = (selfRadarProgress.value + SELF_RADAR_PHASE) % 1;
    return { transform: [{ scale: 0.6 + t }], opacity: 0.22 * (1 - t) };
  });
  const selfWave3Style = useAnimatedStyle(() => {
    const t = (selfRadarProgress.value + 2 * SELF_RADAR_PHASE) % 1;
    return { transform: [{ scale: 0.6 + t }], opacity: 0.18 * (1 - t) };
  });
  const selfAndroidPulseStyle = useAnimatedStyle(() => {
    const t = selfRadarProgress.value;
    const scale = 0.92 + t * 0.2;
    const opacity = 0.22 * (1 - t);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const flagRadarDotStyle = useAnimatedStyle(() => {
    const angleRad = (radarAngleDeg.value * Math.PI) / 180;
    const x = Math.cos(angleRad) * FLAG_RADAR_RADIUS;
    const y = Math.sin(angleRad) * FLAG_RADAR_RADIUS;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  const showRadarDot = radarEnabled && !!roomState.flag && !roomState.flag.isCaptured;


  return (
    <View style={styles.selfMarker} collapsable={false}>
      <View style={styles.selfMarkerWaveLayer} pointerEvents="none">
        <Animated.View style={[styles.selfMarkerWave, selfWave1Style]} />
        <Animated.View style={[styles.selfMarkerWave, selfWave2Style]} />
        <Animated.View style={[styles.selfMarkerWave, selfWave3Style]} />
      </View>

      <View style={styles.selfMarkerAvatarWrap}>
        <View style={styles.selfMarkerAvatarClip}>
          {avatarId != null && avatarId !== 0 ? (
            <Image
              source={{ uri: `${apiConfig.baseUrl}/public_assets/avatars/${avatarId}.webp` }}
              style={styles.selfMarkerImage}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.selfMarkerImage, styles.avatarMarkerPlaceholder]} />
          )}
        </View>

        {showRadarDot && (
          <Animated.View style={[styles.flagRadarDot, flagRadarDotStyle]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selfMarkerAndroid: {
    width: AVATAR_OUTER_SIZE + 8,
    height: AVATAR_OUTER_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  selfAndroidPulseRing: {
    position: 'absolute',
    width: AVATAR_OUTER_SIZE,
    height: AVATAR_OUTER_SIZE,
    borderRadius: AVATAR_OUTER_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.radarBorder,
    backgroundColor: colors.radarBackground,
  },
  selfMarker: {
    width: SELF_MARKER_CONTAINER,
    height: SELF_MARKER_CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
    // Evita clipping agressivo no snapshot do Marker (Google Maps); ondas ficam clipadas em selfMarkerWaveLayer.
    overflow: 'visible',
  },
  selfMarkerWaveLayer: {
    position: 'absolute',
    width: SELF_MARKER_CONTAINER,
    height: SELF_MARKER_CONTAINER,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfMarkerWave: {
    position: 'absolute',
    width: SELF_RADAR_SIZE,
    height: SELF_RADAR_SIZE,
    left: (SELF_MARKER_CONTAINER - SELF_RADAR_SIZE) / 2,
    top: (SELF_MARKER_CONTAINER - SELF_RADAR_SIZE) / 2,
    borderRadius: SELF_RADAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.radarBorder,
    backgroundColor: colors.radarBackground,
  },
  selfMarkerAvatarWrap: {
    width: AVATAR_OUTER_SIZE,
    height: AVATAR_OUTER_SIZE,
    borderRadius: AVATAR_OUTER_SIZE / 2,
    borderWidth: AVATAR_BORDER_WIDTH,
    borderColor: colors.primary,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfMarkerAvatarClip: {
    width: SELF_AVATAR_SIZE,
    height: SELF_AVATAR_SIZE,
    borderRadius: SELF_AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  selfMarkerImage: {
    width: SELF_AVATAR_SIZE,
    height: SELF_AVATAR_SIZE,
    borderRadius: SELF_AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatarMarkerPlaceholder: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  flagRadarDot: {
    position: 'absolute',
    width: FLAG_RADAR_DOT_SIZE,
    height: FLAG_RADAR_DOT_SIZE,
    borderRadius: FLAG_RADAR_DOT_SIZE / 2,
    backgroundColor: colors.flagRadarDot,
    left: SELF_AVATAR_SIZE / 2 - FLAG_RADAR_DOT_SIZE / 2,
    top: SELF_AVATAR_SIZE / 2 - FLAG_RADAR_DOT_SIZE / 2,
  },
});

