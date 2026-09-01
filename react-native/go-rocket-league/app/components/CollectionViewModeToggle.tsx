import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

const ICON_SIZE = 20;
const BUTTON_SIZE = 40;
const GAP = 4;
const CONTAINER_PADDING = 4;
const PILL_RADIUS = 20;

const PILL_SLIDE_DISTANCE = BUTTON_SIZE + GAP;

function getPillOffset(mode: ViewMode): number {
  switch (mode) {
    case 'grid':
      return 0;
    case 'list':
      return PILL_SLIDE_DISTANCE;
    case 'bySelection':
      return PILL_SLIDE_DISTANCE * 2;
    default:
      return 0;
  }
}

export type ViewMode = 'grid' | 'list' | 'bySelection';

export interface CollectionViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function CollectionViewModeToggle({
  value,
  onChange,
}: CollectionViewModeToggleProps) {
  const pillX = useSharedValue(getPillOffset(value));

  useEffect(() => {
    pillX.value = withTiming(getPillOffset(value), {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const handlePress = (mode: ViewMode) => {
    if (mode === value) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(mode);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pillWrap, pillStyle]} pointerEvents="none">
        <Canvas style={styles.pillCanvas}>
          <RoundedRect
            x={0}
            y={0}
            width={BUTTON_SIZE}
            height={BUTTON_SIZE}
            r={PILL_RADIUS}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(BUTTON_SIZE, BUTTON_SIZE)}
              colors={[
                colors.primaryGradientStart,
                colors.primaryGradientEnd,
              ]}
            />
          </RoundedRect>
        </Canvas>
      </Animated.View>

      <Pressable
        onPress={() => handlePress('grid')}
        style={styles.button}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'grid' }}
        accessibilityLabel="Grid view"
      >
        <Ionicons
          name="grid"
          size={ICON_SIZE}
          color={value === 'grid' ? colors.text : colors.textMuted}
        />
      </Pressable>

      <Pressable
        onPress={() => handlePress('list')}
        style={styles.button}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'list' }}
        accessibilityLabel="List view"
      >
        <Ionicons
          name="list"
          size={ICON_SIZE}
          color={value === 'list' ? colors.text : colors.textMuted}
        />
      </Pressable>

      <Pressable
        onPress={() => handlePress('bySelection')}
        style={styles.button}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'bySelection' }}
        accessibilityLabel="Agrupar por seleção"
      >
        <Ionicons
          name="globe-outline"
          size={ICON_SIZE}
          color={value === 'bySelection' ? colors.text : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: PILL_RADIUS + CONTAINER_PADDING,
    padding: CONTAINER_PADDING,
  },
  pillWrap: {
    position: 'absolute',
    left: CONTAINER_PADDING,
    top: CONTAINER_PADDING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 0,
  },
  pillCanvas: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: PILL_RADIUS,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
