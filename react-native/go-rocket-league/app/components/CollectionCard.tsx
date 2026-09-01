import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, palette } from '@/theme';
import { CardArtwork } from '@/components/CardArtwork';
import type { CollectionCard as CollectionCardType } from '@/demo';
import type { CardRarity } from '@/demo';
import { t } from '@/i18n';

const BORDER_WIDTH = 1;
const CARD_RADIUS = 16;
const OUTER_RADIUS = CARD_RADIUS + BORDER_WIDTH;

const RARITY_GRADIENT: Record<CardRarity, [string, string]> = {
  Legendary: [palette.amber[500], palette.yellow[400]],
  Rare: [colors.secondaryGradientStart, colors.secondaryGradientEnd],
  Common: [colors.primaryGradientEnd, colors.primaryGradientStart],
  Epic: [colors.secondaryGradientStart, colors.secondaryGradientEnd],
};

export type CollectionCardVariant = 'grid' | 'list' | 'bySelection';

export interface CollectionCardProps {
  card: CollectionCardType;
  variant: CollectionCardVariant;
  onPress?: () => void;
}

const GRID_GRADIENT_END = { x: 200, y: 220 };
const LIST_GRADIENT_END = { x: 400, y: 120 };

export function CollectionCard({ card, variant, onPress }: CollectionCardProps) {
  const [start, end] = RARITY_GRADIENT[card.rarity];
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ width, height });
  };

  const foundText = useMemo(
    () =>
      t('cards.foundLabel', {
        foundFormatted: card.foundCount.toLocaleString(),
        totalFormatted: (card.maxSupply ?? card.totalCount ?? 0).toLocaleString(),
      }),
    [card.foundCount, card.totalCount, card.maxSupply]
  );

  if (variant === 'grid') {
    return (
      <Pressable onPress={onPress} style={styles.gridPressable}>
        <View style={styles.gridOuter} onLayout={onLayout}>
          {size.width > 0 && size.height > 0 && (
            <Canvas style={[StyleSheet.absoluteFill, { width: size.width, height: size.height }]}>
              <RoundedRect
                x={0}
                y={0}
                width={size.width}
                height={size.height}
                r={OUTER_RADIUS}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(GRID_GRADIENT_END.x, GRID_GRADIENT_END.y)}
                  colors={[start, end]}
                />
              </RoundedRect>
            </Canvas>
          )}
          <View style={styles.gridInner}>
            <View style={styles.gridImageWrap}>
              <CardArtwork uri={card.image} style={styles.gridImage} pointerEvents="none" />
              {card.flagEmoji && (
                <View style={styles.gridFlagBadge}>
                  <Text style={styles.gridFlagText}>{card.flagEmoji}</Text>
                </View>
              )}
              {card.rank != null && (
                <View style={styles.gridRankOnImagePill}>
                  <Text style={styles.gridRankText}>#{card.rank}</Text>
                </View>
              )}
              <View style={styles.gridImageOverlay} />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{card.rating}</Text>
              </View>
              <View style={[styles.rarityBadge, { backgroundColor: start }]}>
                <Ionicons name="star" size={10} color={colors.text} />
              </View>
            </View>
            <View style={styles.gridInfo}>
              <View style={styles.gridInfoContent}>
                <Text style={styles.gridPlayerName} numberOfLines={1}>
                  {card.player}
                </Text>
                <Text style={styles.gridTeam}>{card.nation}</Text>
                  <Text style={styles.gridFoundTotal} numberOfLines={1} >{foundText}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={styles.listPressable}>
      <View style={styles.listOuter} onLayout={onLayout}>
        {size.width > 0 && size.height > 0 && (
          <Canvas style={[StyleSheet.absoluteFill, { width: size.width, height: size.height }]}>
            <RoundedRect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              r={OUTER_RADIUS}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(LIST_GRADIENT_END.x, LIST_GRADIENT_END.y)}
                colors={[start, end]}
              />
            </RoundedRect>
          </Canvas>
        )}
        <View style={styles.listInner}>
          <View style={styles.listImageWrap}>
              <CardArtwork uri={card.image} style={styles.listImage} pointerEvents="none" />
              {card.flagEmoji && (
                <View style={styles.listFlagBadge}>
                  <Text style={styles.listFlagText}>{card.flagEmoji}</Text>
                </View>
              )}
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listPlayerName} numberOfLines={1}>
                {card.player}
              </Text>
              <Text style={styles.listTeam}>{card.nation}</Text>
              <View style={styles.listMetaRow}>
                <View style={styles.listRarityRow}>
                  <Ionicons name="star" size={12} color={colors.accentLight} />
                  <Text style={styles.listRarityText}>{card.rarity}</Text>
                </View>
                {card.rank != null && (
                  <View style={styles.listRankPill}>
                    <Text style={styles.listRankText}>#{card.rank}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.listFoundTotal}>{foundText}</Text>
            </View>
          <View style={styles.listRatingWrap}>
            <Text style={styles.listRatingText}>{card.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridPressable: {
    flex: 1,
    minWidth: 0,
  },
  gridOuter: {
    position: 'relative',
    padding: BORDER_WIDTH,
    borderRadius: OUTER_RADIUS,
    overflow: 'hidden',
    width: '100%',
    minHeight: 220,
  },
  gridInner: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.card,
    overflow: 'hidden',
    zIndex: 1,
  },
  gridImageWrap: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  gridFlagBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 999,
    // backgroundColor: colors.card
  },
  gridFlagText: {
    fontSize: 26,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  gridImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  ratingBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.hudCardBackground,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  rarityBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  gridInfoContent: {
    padding: 12,
  },
  gridPlayerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  gridTeam: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 8,
  },
  gridRankOnImagePill: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.hudCardBackground + 'E6',
    borderWidth: 1,
    borderColor: colors.accentLight,
    zIndex: 2,
  },
  gridRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentLight,
  },
  gridFoundTotal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
  },
  listPressable: {
    width: '100%',
  },
  listOuter: {
    position: 'relative',
    padding: BORDER_WIDTH,
    borderRadius: OUTER_RADIUS,
    overflow: 'hidden',
    width: '100%',
    minHeight: 100,
  },
  listInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: CARD_RADIUS,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  listImageWrap: {
    position: 'relative',
  },
  listImage: {
    width: 80,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.cardBorder,
  },
  listFlagBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  listFlagText: {
    fontSize: 14,
  },
  listContent: {
    flex: 1,
    minWidth: 0,
  },
  listPlayerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  listTeam: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
    marginBottom: 6,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listRarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  listRankPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.hudCardBackground,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  listRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  listFoundTotal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
  },
  listRatingWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRatingText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
});
