import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CardArtwork } from '@/components/CardArtwork';
import type { PackGrantedCard, PackSerialClass } from '@/lib/colyseus/types';
import type { PackCardDisplayInfo } from '@/lib/cards/packCardDisplay';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const BORDER = 2;
const CARD_RADIUS = 16;
const OUTER_RADIUS = CARD_RADIUS + BORDER;
/** Carta vertical (retrato), proporção ~ carta física. */
const CARD_ASPECT = 1.45;
const LOGO_IMAGE = require('@/assets/images/logo.png');

const SERIAL_GRADIENT: Record<PackSerialClass, { colors: [string, string] }> = {
  extreme: {
    colors: [palette.amber[500], palette.yellow[400]],
  },
  elite: {
    colors: [palette.purple[500], palette.pink[400]],
  },
  standard: {
    colors: [palette.slate[600], palette.cyan[600]],
  },
};

export type CardRevealProps = {
  card: PackGrantedCard;
  display: PackCardDisplayInfo;
  revealed: boolean;
  onReveal: () => void;
  compact?: boolean;
};

function SkiaCardFrame({
  width,
  height,
  gradColors,
}: {
  width: number;
  height: number;
  gradColors: [string, string];
}) {
  if (width <= 0 || height <= 0) return null;
  return (
    <Canvas style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <RoundedRect x={0} y={0} width={width} height={height} r={OUTER_RADIUS}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={gradColors}
        />
      </RoundedRect>
    </Canvas>
  );
}

export function CardReveal({ card, display, revealed, onReveal, compact = false }: CardRevealProps) {
  const { width: screenW } = useWindowDimensions();
  const maxW = compact ? 220 : 248;
  const cardW = Math.min(maxW, screenW - 56);
  const cardH = cardW * CARD_ASPECT;

  const grad = SERIAL_GRADIENT[card.serialClass];
  const serialLabel = t(`cards.pack.serialClass.${card.serialClass}`);

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (revealed) {
      rotation.value = withTiming(180, {
        duration: 680,
        easing: Easing.inOut(Easing.cubic),
      });
    } else {
      rotation.value = withTiming(0, { duration: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `rotation` é SharedValue estável
  }, [revealed]);

  useEffect(() => {
    if (!revealed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = 1;
    }
  }, [revealed, pulse]);

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1400 }, { rotateY: `${rotation.value}deg` }],
  }));

  /**
   * Troca de face em 90° (sem fade): evita Skia em view com opacity intermediária (fica em branco em alguns devices)
   * e evita ambas as faces com alpha ~0 ao mesmo tempo.
   */
  const backFaceStyle = useAnimatedStyle(() => ({
    opacity: rotation.value < 90 ? 1 : 0,
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    opacity: rotation.value < 90 ? 0 : 1,
    transform: [{ rotateY: '180deg' }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const artRatio = compact ? 0.58 : 0.62;
  const artHeight = cardH * artRatio;

  return (
    <Pressable
      onPress={onReveal}
      disabled={revealed}
      style={styles.pressWrap}
      accessibilityRole="button"
      accessibilityLabel={
        revealed
          ? t('cards.pack.revealedAccessibility', { name: display.playerName })
          : t('cards.pack.tapToReveal')
      }>
      <Animated.View style={[styles.center, pulseStyle]}>
        <View style={[styles.flipStage, { width: cardW, height: cardH }]}>
          <Animated.View style={[styles.flipInner, { width: cardW, height: cardH }, flipStyle]}>
            {/* Costas: logo + CTA no footer */}
            <Animated.View
              needsOffscreenAlphaCompositing
              collapsable={false}
              style={[styles.face, { width: cardW, height: cardH }, backFaceStyle]}
              pointerEvents="box-none">
              <SkiaCardFrame width={cardW} height={cardH} gradColors={grad.colors} />
              <View style={styles.innerClip}>
                <View style={styles.backContent}>
                  <View style={styles.backPattern}>
                    <Image
                      source={LOGO_IMAGE}
                      style={[styles.logo, compact && styles.logoCompact]}
                      resizeMode="contain"
                      fadeDuration={0}
                    />
                  </View>
                  <View style={styles.footerHint}>
                    <Text style={[styles.hint, compact && styles.hintSm]}>{t('cards.pack.tapToReveal')}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Frente: jogador + meta (girada 180° para alinhar com o fim do flip do pai) */}
            <Animated.View
              needsOffscreenAlphaCompositing
              collapsable={false}
              style={[styles.face, { width: cardW, height: cardH }, frontFaceStyle]}
              pointerEvents="box-none">
              <SkiaCardFrame width={cardW} height={cardH} gradColors={grad.colors} />
              <View style={styles.innerClip}>
                <View style={styles.frontColumn}>
                  <View style={[styles.artWrap, { height: artHeight }]}>
                    <CardArtwork uri={display.imageUri} style={styles.art} pointerEvents="none" />
                    <View style={styles.ovrBadge}>
                      <Text style={styles.ovrText}>{display.rating > 0 ? display.rating : '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.meta}>
                    <Text style={[styles.playerName, compact && styles.playerNameSm]} numberOfLines={2}>
                      {display.playerName}
                    </Text>
                    {display.team ? (
                      <Text style={styles.team} numberOfLines={1}>
                        {display.team}
                      </Text>
                    ) : null}
                    <Text style={styles.serialLine}>
                      {t('cards.pack.serialLine', {
                        n: card.serialNumber,
                        max: card.serialMax,
                      })}
                    </Text>
                    <View style={[styles.serialPill, { borderColor: grad.colors[0] }]}>
                      <Text style={styles.serialPillText}>{serialLabel}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  flipStage: {
    alignSelf: 'center',
  },
  flipInner: {
    position: 'relative',
    overflow: 'visible',
  },
  face: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: OUTER_RADIUS,
    /** Não usar overflow:hidden na face 3D — no ~90° o plano fica de perfil e o clip pode “apagar” tudo. */
    overflow: 'visible',
  },
  innerClip: {
    position: 'absolute',
    left: BORDER,
    right: BORDER,
    top: BORDER,
    bottom: BORDER,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  backContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 52,
    paddingHorizontal: 14,
    minHeight: 120,
  },
  backPattern: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 170,
    opacity: 0.96,
  },
  logoCompact: {
    width: 145,
    height: 145,
  },
  footerHint: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(2, 6, 23, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.25)',
  },
  hint: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    textAlign: 'center',
    opacity: 0.9,
  },
  hintSm: {
    fontSize: 12,
  },
  frontColumn: {
    flex: 1,
  },
  artWrap: {
    position: 'relative',
    width: '100%',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  art: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  ovrBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.hudCardBackground,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovrText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 3,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  playerNameSm: {
    fontSize: 14,
  },
  team: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  serialLine: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  serialPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  serialPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
