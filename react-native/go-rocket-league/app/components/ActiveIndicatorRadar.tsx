import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, palette } from '@/theme';

const WAVE_SIZE = 36;
const BORDER_WIDTH = 1.5;
const CYCLE_DURATION_MS = 3000;
const PHASE_OFFSET = 1 / 3; // 120° entre ondas

export function ActiveIndicatorRadar() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: CYCLE_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const wave1Style = useAnimatedStyle(() => {
    const t = progress.value;
    const scale = 0.6 + t;
    const opacity = 0.28 * (1 - t);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    const t = (progress.value + PHASE_OFFSET) % 1;
    const scale = 0.6 + t;
    const opacity = 0.22 * (1 - t);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const wave3Style = useAnimatedStyle(() => {
    const t = (progress.value + 2 * PHASE_OFFSET) % 1;
    const scale = 0.6 + t;
    const opacity = 0.18 * (1 - t);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.wave, wave1Style]} />
      <Animated.View style={[styles.wave, wave2Style]} />
      <Animated.View style={[styles.wave, wave3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: WAVE_SIZE,
    height: WAVE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: WAVE_SIZE,
    height: WAVE_SIZE,
    borderRadius: WAVE_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.radarBorder,
    backgroundColor: colors.radarBackground,
  },
});
