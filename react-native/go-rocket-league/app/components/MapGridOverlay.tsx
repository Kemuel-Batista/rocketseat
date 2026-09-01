import {
  Canvas,
  Group,
  LinearGradient,
  Line,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, palette } from '@/theme';

const GRID_SPACING = 40;
const STROKE_WIDTH = 1;
const SHIMMER_LEN = 56;
const SHIMMER_THICK = 2;
const SHIMMER_DURATION_MS = 2600;
const SHIMMER_COLOR = palette.cyan[400] + '50';

type ShimmerLine = { orientation: 'v' | 'h'; index: number; key: number };

function pickRandomLine(
  w: number,
  h: number,
  numVertical: number,
  numHorizontal: number
): ShimmerLine {
  const vertical = numVertical > 0;
  const horizontal = numHorizontal > 0;
  if (vertical && horizontal) {
    if (Math.random() < 0.5) {
      return { orientation: 'v', index: Math.floor(Math.random() * numVertical), key: Date.now() };
    }
    return { orientation: 'h', index: Math.floor(Math.random() * numHorizontal), key: Date.now() };
  }
  if (vertical) return { orientation: 'v', index: Math.floor(Math.random() * numVertical), key: Date.now() };
  if (horizontal) return { orientation: 'h', index: Math.floor(Math.random() * numHorizontal), key: Date.now() };
  return { orientation: 'v', index: 0, key: Date.now() };
}

/**
 * Builds grid line segments for vertical and horizontal lines.
 * Returns arrays of { p1, p2 } for each line.
 */
function useGridLines(width: number, height: number) {
  return useMemo(() => {
    const vertical: { p1: ReturnType<typeof vec>; p2: ReturnType<typeof vec> }[] = [];
    const horizontal: { p1: ReturnType<typeof vec>; p2: ReturnType<typeof vec> }[] = [];

    for (let x = 0; x <= width; x += GRID_SPACING) {
      vertical.push({ p1: vec(x, 0), p2: vec(x, height) });
    }
    for (let y = 0; y <= height; y += GRID_SPACING) {
      horizontal.push({ p1: vec(0, y), p2: vec(width, y) });
    }

    return { vertical, horizontal };
  }, [width, height]);
}

export function MapGridOverlay() {
  const { width, height } = useWindowDimensions();
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });
  const w = layoutSize.width > 0 ? layoutSize.width : width;
  const h = layoutSize.height > 0 ? layoutSize.height : height;

  const { vertical, horizontal } = useGridLines(w, h);
  const numVertical = vertical.length;
  const numHorizontal = horizontal.length;

  const [line1, setLine1] = useState<ShimmerLine | null>(null);
  const [line2, setLine2] = useState<ShimmerLine | null>(null);
  const position1 = useSharedValue(0);
  const position2 = useSharedValue(0);
  const line1Vertical = useSharedValue(1);
  const line1Index = useSharedValue(0);
  const line2Vertical = useSharedValue(1);
  const line2Index = useSharedValue(0);
  const dimW = useSharedValue(w);
  const dimH = useSharedValue(h);
  const mounted = useRef(true);

  useEffect(() => {
    dimW.value = w;
    dimH.value = h;
  }, [w, h]);

  useEffect(() => {
    mounted.current = true;
    if (w > 0 && h > 0 && numVertical > 0 && numHorizontal > 0) {
      setLine1(pickRandomLine(w, h, numVertical, numHorizontal));
      setLine2(pickRandomLine(w, h, numVertical, numHorizontal));
    }
    return () => {
      mounted.current = false;
    };
  }, [w, h, numVertical, numHorizontal]);

  useEffect(() => {
    if (w <= 0 || h <= 0 || numVertical === 0 || numHorizontal === 0) return;
    const id = setInterval(() => {
      if (!mounted.current) return;
      setLine1(pickRandomLine(w, h, numVertical, numHorizontal));
      setLine2(pickRandomLine(w, h, numVertical, numHorizontal));
    }, SHIMMER_DURATION_MS);
    return () => clearInterval(id);
  }, [w, h, numVertical, numHorizontal]);

  useEffect(() => {
    if (!line1 || w <= 0 || h <= 0) return;
    line1Vertical.value = line1.orientation === 'v' ? 1 : 0;
    line1Index.value = line1.index;
    position1.value = 0;
    position1.value = withTiming(1, {
      duration: SHIMMER_DURATION_MS,
      easing: Easing.linear,
    });
  }, [line1?.key, w, h]);

  useEffect(() => {
    if (!line2 || w <= 0 || h <= 0) return;
    line2Vertical.value = line2.orientation === 'v' ? 1 : 0;
    line2Index.value = line2.index;
    position2.value = 0;
    position2.value = withTiming(1, {
      duration: SHIMMER_DURATION_MS,
      easing: Easing.linear,
    });
  }, [line2?.key, w, h]);

  const transform1 = useDerivedValue(() => {
    const pos = position1.value;
    const isV = line1Vertical.value;
    const idx = line1Index.value;
    const width = dimW.value;
    const height = dimH.value;
    if (isV) {
      const x = idx * GRID_SPACING - SHIMMER_THICK / 2;
      const y = pos * (height - SHIMMER_LEN);
      return [{ translateX: x }, { translateY: y }];
    }
    const x = pos * (width - SHIMMER_LEN);
    const y = idx * GRID_SPACING - SHIMMER_THICK / 2;
    return [{ translateX: x }, { translateY: y }];
  });

  const transform2 = useDerivedValue(() => {
    const pos = position2.value;
    const isV = line2Vertical.value;
    const idx = line2Index.value;
    const width = dimW.value;
    const height = dimH.value;
    if (isV) {
      const x = idx * GRID_SPACING - SHIMMER_THICK / 2;
      const y = pos * (height - SHIMMER_LEN);
      return [{ translateX: x }, { translateY: y }];
    }
    const x = pos * (width - SHIMMER_LEN);
    const y = idx * GRID_SPACING - SHIMMER_THICK / 2;
    return [{ translateX: x }, { translateY: y }];
  });

  if (w <= 0 || h <= 0) return null;

  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      onLayout={(e) => {
        const { width: lw, height: lh } = e.nativeEvent.layout;
        setLayoutSize({ width: lw, height: lh });
      }}
      pointerEvents="none">
      <Canvas style={{ width: w, height: h }}>
        {vertical.map(({ p1, p2 }, i) => (
          <Line
            key={`v-${i}`}
            p1={p1}
            p2={p2}
            color={colors.mapGridLine}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
          />
        ))}
        {horizontal.map(({ p1, p2 }, i) => (
          <Line
            key={`h-${i}`}
            p1={p1}
            p2={p2}
            color={colors.mapGridLine}
            style="stroke"
            strokeWidth={STROKE_WIDTH}
          />
        ))}

        {line1 && (
          <Group transform={transform1}>
            <Rect x={0} y={0} width={line1.orientation === 'v' ? SHIMMER_THICK : SHIMMER_LEN} height={line1.orientation === 'v' ? SHIMMER_LEN : SHIMMER_THICK}>
              <LinearGradient
                start={line1.orientation === 'v' ? vec(0, 0) : vec(0, 0)}
                end={line1.orientation === 'v' ? vec(0, SHIMMER_LEN) : vec(SHIMMER_LEN, 0)}
                colors={['transparent', SHIMMER_COLOR, 'transparent']}
                positions={[0, 0.5, 1]}
              />
            </Rect>
          </Group>
        )}
        {line2 && (
          <Group transform={transform2}>
            <Rect x={0} y={0} width={line2.orientation === 'v' ? SHIMMER_THICK : SHIMMER_LEN} height={line2.orientation === 'v' ? SHIMMER_LEN : SHIMMER_THICK}>
              <LinearGradient
                start={line2.orientation === 'v' ? vec(0, 0) : vec(0, 0)}
                end={line2.orientation === 'v' ? vec(0, SHIMMER_LEN) : vec(SHIMMER_LEN, 0)}
                colors={['transparent', SHIMMER_COLOR, 'transparent']}
                positions={[0, 0.5, 1]}
              />
            </Rect>
          </Group>
        )}
      </Canvas>
    </View>
  );
}
