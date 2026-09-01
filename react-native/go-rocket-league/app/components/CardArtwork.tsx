import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  ImageStyle,
  View,
  type ViewProps,
} from 'react-native';
import {
  Canvas,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';

import { colors } from '@/theme';
import { apiConfig } from '@/lib/api/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bgCard = require('@/assets/bgCard.png');

export interface CardArtworkProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  /** Use "none" quando o card estiver dentro de um Pressable para o toque passar ao pai. */
  pointerEvents?: ViewProps['pointerEvents'];
}

/**
 * Lightweight card artwork component.
 * - Usa expo-image (lazy loading, cache).
 * - Futuramente pode ser substituído por versão com Skia / filtros.
 */
export function CardArtwork({ uri, style, pointerEvents = 'auto' }: CardArtworkProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const shimmerY = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(1)).current;

  const resolvedUri = uri
    ? /^https?:\/\//i.test(uri)
      ? uri
      : `${apiConfig.baseUrl}${uri.startsWith('/') ? '' : '/'}${uri}`
    : undefined;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    }
  };

  // Fade-in suave do card artwork
  useEffect(() => {
    
    Animated.timing(fadeOpacity, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeOpacity]);

  // Shimmer scan de cima / baixo enquanto a imagem não carregou
  const SHIMMER_HEIGHT = 40;
  useEffect(() => {
    if (size.height <= 0) return;

    // se já carregou, só desbota o shimmer
    if (imageLoaded) {
      Animated.timing(shimmerOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      return;
    }

    shimmerY.setValue(-SHIMMER_HEIGHT);
    shimmerOpacity.setValue(1);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerY, {
          toValue: size.height + SHIMMER_HEIGHT,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerY, {
          toValue: -SHIMMER_HEIGHT,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [size.height, imageLoaded, shimmerOpacity, shimmerY]);

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[styles.container, style, { opacity: fadeOpacity }]}
      onLayout={handleLayout}
    >
      <Image
        source={bgCard}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
      />

      {size.width > 0 && size.height > 0 && resolvedUri && (
        <Image
          source={{ uri: resolvedUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      {/* Shimmer vertical inicial */}
      {size.width > 0 && size.height > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: shimmerOpacity,
              transform: [{ translateY: shimmerY }],
            },
          ]}
        >
          <Canvas style={{ width: size.width, height: SHIMMER_HEIGHT }}>
            <Rect x={0} y={0} width={size.width} height={SHIMMER_HEIGHT}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, SHIMMER_HEIGHT)}
                colors={[
                  'transparent',
                  'rgba(255,255,255,0.06)',
                  'rgba(255,255,255,0.30)',
                  'rgba(255,255,255,0.06)',
                  'transparent',
                ]}
              />
            </Rect>
          </Canvas>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBorder,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

