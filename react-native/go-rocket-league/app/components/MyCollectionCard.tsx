import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';

import type { CardInstance, CardRarity, CardStats, CollectionCard } from '@/demo';
import { colors, palette } from '@/theme';
import { CardArtwork } from '@/components/CardArtwork';

const PHOTO_RARITY_OVERLAY_HEIGHT = 36;

const DEFAULT_STATS: CardStats = {
  speed: 80,
  shooting: 78,
  passing: 82,
  dribbling: 85,
  defense: 70,
  physical: 75,
};

const STAT_ROW_CONFIG: Array<{
  key: keyof CardStats;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}> = [
  { key: 'speed', icon: 'flash', color: palette.yellow[500] },
  { key: 'shooting', icon: 'target', color: palette.red[500] },
  { key: 'passing', icon: 'share', color: palette.green[500] },
  { key: 'dribbling', icon: 'star', color: palette.purple[500] },
  { key: 'defense', icon: 'shield', color: palette.blue[500] },
  { key: 'physical', icon: 'arm-flex', color: palette.orange[500] },
];

function getStatsWithDefaults(stats?: CardStats | null): CardStats {
  return { ...DEFAULT_STATS, ...stats };
}

function getRarityBadgeStyle(rarity: CardRarity) {
  switch (rarity) {
    case 'Legendary':
      return { backgroundColor: palette.amber[500] };
    case 'Rare':
      return { backgroundColor: colors.rarityRare };
    case 'Common':
    default:
      return { backgroundColor: colors.rarityCommon };
  }
}

function InfoRow({
  value,
  icon,
}: {
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={14} color={colors.textMuted} style={styles.infoIcon} />
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export interface MyCollectionCardProps {
  card: CollectionCard;
  instance: CardInstance;
  onProposePress?: (card: CollectionCard, instance: CardInstance) => void;
  onViewProposalsPress?: (card: CollectionCard, instance: CardInstance) => void;
}

export function MyCollectionCard({
  card,
  instance,
  onViewProposalsPress,
}: MyCollectionCardProps) {
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const stats = getStatsWithDefaults(card.stats);
  const hasProposals = instance.proposalCount > 1;
  const nationDisplay = card.nation?.trim()
    ? `${card.flagEmoji ? `${card.flagEmoji} ` : ''}${card.nation.trim()}`
    : '—';
  const teamDisplay = card.team?.trim() ? card.team.trim() : '—';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.playerName} numberOfLines={1}>
            {card.player}
          </Text>
            <Text style={styles.ovrText}>{card.rating}</Text>
        </View>
        <View style={[styles.rarityBadge, getRarityBadgeStyle(card.rarity)]}>
          <Text style={styles.rarityText}>{card.rarity}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.photoRow}>
          <View style={styles.photoWrap}>
            <CardArtwork uri={card.image} style={styles.photo} />
            <View
              style={styles.photoRarityOverlay}
              onLayout={(e: LayoutChangeEvent) => {
                const { width, height } = e.nativeEvent.layout;
                if (width > 0 && height > 0) setOverlaySize({ width, height });
              }}
            >
              {overlaySize.width > 0 && overlaySize.height > 0 && (
                <Canvas style={[StyleSheet.absoluteFill, { width: overlaySize.width, height: overlaySize.height }]}>
                  <Rect x={0} y={0} width={overlaySize.width} height={overlaySize.height}>
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(0, overlaySize.height)}
                      colors={['transparent', 'rgba(0,0,0,0.95)']}
                    />
                  </Rect>
                </Canvas>
              )}
              <View style={styles.photoRarityLabel}>
                <Text style={styles.photoRarityText}>{instance.id} / {card.totalCount}</Text>
              </View>
            </View>
          </View>
          <View style={styles.detailsBlock}>
            <InfoRow value={instance.foundWhen} icon="calendar-outline" />
            <InfoRow value={instance.foundWhere} icon="location-outline" />
            <InfoRow value={teamDisplay} icon="shield-outline" />
            <View style={styles.proposalsLine}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textMuted} style={styles.proposalsIcon} />
              <Text style={styles.proposalsValue}>{instance.proposalCount}</Text>
              {hasProposals && (
                <Pressable
                  style={({ pressed }) => [styles.viewProposalsBtn, pressed && styles.viewProposalsBtnPressed]}
                  onPress={() => onViewProposalsPress?.(card, instance)}
                >
                  <Text style={styles.viewProposalsBtnText}>Ver propostas</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primaryLight} />
                </Pressable>
              )}
            </View>
            <Text style={styles.nationText} numberOfLines={2}>
              {nationDisplay}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            {STAT_ROW_CONFIG.map(({ key, icon, color }) => (
              <View key={key} style={styles.statPill}>
                <MaterialCommunityIcons name={icon} size={18} color={color} />
                <Text style={styles.statValue}>{stats[key]}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  ovrText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginRight: 10,
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    padding: 16,
    gap: 14,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 14,
  },
  photoWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.cardBorder,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoRarityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PHOTO_RARITY_OVERLAY_HEIGHT,
    justifyContent: 'flex-end',
  },
  photoRarityLabel: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  photoRarityText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  detailsBlock: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 18,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    width: 88,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    minWidth: 0,
  },
  proposalsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proposalsIcon: {
    width: 18,
  },
  proposalsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    minWidth: 0,
  },
  viewProposalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewProposalsBtnPressed: {
    opacity: 0.8,
  },
  viewProposalsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  nationText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statsRow: {
    marginTop: 2,
  },
  statsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  proposeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary + '80',
  },
  proposeBtnPressed: {
    opacity: 0.9,
  },
  proposeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
