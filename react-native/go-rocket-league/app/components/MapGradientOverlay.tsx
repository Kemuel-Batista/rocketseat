import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { colors } from '@/theme';

/** Fraction of height used for top/bottom fade (each). Center stays clear. */
const FADE_FRACTION = 0.2;

/**
 * Vertical gradient overlay on the map: darkens top and bottom with theme
 * background color, leaving the center brighter. Renders below the grid.
 */
export function MapGradientOverlay() {
  const { width, height } = useWindowDimensions();
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const w = layoutSize.width > 0 ? layoutSize.width : width;
  const h = layoutSize.height > 0 ? layoutSize.height : height;

  const topHeight = h * FADE_FRACTION;
  const bottomY = h * (1 - FADE_FRACTION);
  const bottomHeight = h - bottomY;

  if (w <= 0 || h <= 0) return null;

  const bg = colors.background;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      onLayout={(e) => {
        const { width: lw, height: lh } = e.nativeEvent.layout;
        setLayoutSize({ width: lw, height: lh });
      }}
      pointerEvents="none">
      <Canvas style={{ width: w, height: h }}>
        {/* Top: dark at top → transparent at bottom */}
        <Rect x={0} y={0} width={w} height={topHeight}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, topHeight)}
            colors={[bg, 'transparent']}
          />
        </Rect>
        {/* Bottom: transparent at top → dark at bottom */}
        <Rect x={0} y={bottomY} width={w} height={bottomHeight}>
          <LinearGradient
            start={vec(0, h)}
            end={vec(0, h-bottomHeight)}
            colors={[bg,'transparent']}
          />
        </Rect>
      </Canvas>
    </View>
  );
}
