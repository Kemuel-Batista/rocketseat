import {
  Canvas,
  Group,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, palette } from '@/theme';

const LINE_HEIGHT = 1;
const SHIMMER_WIDTH = 300;
const SHIMMER_DURATION_MS = 2500;

export function TabBarGradientShimmer() {
  const { width } = useWindowDimensions();
  const shimmerX = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    if (width <= 0) return;
    shimmerX.value = -SHIMMER_WIDTH;
    shimmerX.value = withRepeat(
      withTiming(width + SHIMMER_WIDTH, {
        duration: SHIMMER_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, [width]);

  const shimmerTransform = useDerivedValue(() => [
    { translateX: shimmerX.value },
  ]);

  if (width <= 0) return null;

  const cyan400 = palette.cyan[400];
  const cyan500 = palette.cyan[500];

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: LINE_HEIGHT,
        width,
      }}
      pointerEvents="none">
      <Canvas style={{ width, height: LINE_HEIGHT }}>
        {/* Base gradient line: transparent → cyan → cyan → transparent */}
        <Rect x={0} y={0} width={width} height={LINE_HEIGHT}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={[
              'transparent',
              cyan400,
              cyan500,
              cyan400,
              'transparent',
            ]}
            positions={[0, 0.15, 0.5, 0.85, 1]}
          />
        </Rect>

        {/* Shimmer: bright spot that moves left to right */}
        <Group transform={shimmerTransform}>
          <Rect x={0} y={0} width={SHIMMER_WIDTH} height={LINE_HEIGHT}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(SHIMMER_WIDTH, 0)}
              colors={[
                'transparent',
                cyan400,
                colors.shimmerHighlight,
                cyan400,
                'transparent',
              ]}
              positions={[0, 0.25, 0.5, 0.75, 1]}
            />
          </Rect>
        </Group>
      </Canvas>
    </View>
  );
}
