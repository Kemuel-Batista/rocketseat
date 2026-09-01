import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

const ENTRANCE_DELAY_MS = 200;
const ENTRANCE_DURATION_MS = 320;
const ENTRANCE_OFFSET = 20;

interface XpLevelIndicatorProps {
  /** Total XP (default 2450) */
  xp?: number;
  /** Change to re-run entrance animation (e.g. screen focus key) */
  focusKey?: number;
  /** Icon side relative to center of screen */
  iconPosition?: 'left' | 'right';
}

export function XpLevelIndicator({
  xp = 2450,
  focusKey,
  iconPosition = 'left',
}: XpLevelIndicatorProps) {
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withDelay(
      ENTRANCE_DELAY_MS,
      withTiming(1, {
        duration: ENTRANCE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [focusKey]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (entrance.value - 1) * ENTRANCE_OFFSET }],
  }));

  return (
    <Animated.View style={[styles.container, entranceStyle]}>
      <Canvas style={styles.backgroundCanvas}>
        <RoundedRect x={0} y={0} width={110} height={36} r={18}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(110, 36)}
            colors={[colors.mapHudXpGradientCenter, colors.mapHudXpGradientEdge]}
          />
        </RoundedRect>
      </Canvas>
      <View style={[styles.row, iconPosition === 'right' ? styles.rowReverse : null]}>
        <View style={[styles.xpBlock, iconPosition === 'right' ? styles.xpBlockRight : null]}>
          <View style={styles.xpInlineRow}>
            <View style={styles.xpIconCircle}>
              <Ionicons
                name="flash"
                size={12}
                color={colors.mapHudXpIcon}
                style={styles.xpIcon}
              />
            </View>
            <Text style={[styles.xpValue, iconPosition === 'right' ? styles.textAlignRight : null]}>
              {xp.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 110,
    height: 36,
    borderRadius: 999,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.mapHudXpBorder,
    overflow: 'hidden',
  },
  backgroundCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  xpBlock: {
    flex: 1,
  },
  xpBlockRight: {
    alignItems: 'flex-end',
  },
  xpInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'space-between',
  },
  xpIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mapHudXpIconBg,
    borderWidth: 1,
    borderColor: colors.mapHudXpIconBorder,
  },
  xpIcon: {
    marginRight: 0,
  },
  xpValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  textAlignRight: {
    textAlign: 'right',
  },
});
