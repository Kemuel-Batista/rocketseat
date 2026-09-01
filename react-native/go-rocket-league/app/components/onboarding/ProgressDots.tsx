import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

const DOT_SIZE = 8;
const DOT_ACTIVE_WIDTH = 32;
const DOT_GAP = 8;

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} isActive={current === index} />
      ))}
    </View>
  );
}

function Dot({ isActive }: { isActive: boolean }) {
  const scale = useSharedValue(isActive ? 1 : 0.8);
  const width = useSharedValue(isActive ? DOT_ACTIVE_WIDTH : DOT_SIZE);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.8, {
      damping: 20,
      stiffness: 300,
    });
    width.value = withSpring(isActive ? DOT_ACTIVE_WIDTH : DOT_SIZE, {
      damping: 20,
      stiffness: 300,
    });
  }, [isActive, scale, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: width.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: isActive ? colors.primaryLight : colors.divider,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DOT_GAP,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
