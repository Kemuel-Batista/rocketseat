import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import {
  Canvas,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { CardArtwork } from '@/components/CardArtwork';
import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardFoundProgress } from '@/components/CardFoundProgress';
import { colors, palette } from '@/theme';

const bgCardDetails = require('@/assets/bgCardDetails.png');
import type { CollectionCard as CollectionCardType, CardStats } from '@/demo';
import { t } from '@/i18n';

const HERO_ARTWORK_WIDTH = 80;
const HERO_ARTWORK_HEIGHT = 112;

const HERO_HEIGHT = 380;
const LIST_FADE_HEIGHT = 40;
const DEFAULT_STATS: CardStats = {
  speed: 80,
  shooting: 78,
  passing: 82,
  dribbling: 85,
  defense: 70,
  physical: 75,
};

const STAT_CONFIG: Array<{
  key: keyof CardStats;
  labelKey: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  bgColor: string;
}> = [
  { key: 'speed', labelKey: 'cardDetails.stats.speed', icon: 'flash', bgColor: palette.yellow[500] },
  { key: 'shooting', labelKey: 'cardDetails.stats.shooting', icon: 'target', bgColor: palette.red[500] },
  { key: 'passing', labelKey: 'cardDetails.stats.passing', icon: 'share', bgColor: palette.green[500] },
  { key: 'dribbling', labelKey: 'cardDetails.stats.dribbling', icon: 'star', bgColor: palette.purple[500] },
  { key: 'defense', labelKey: 'cardDetails.stats.defense', icon: 'shield', bgColor: palette.blue[500] },
  { key: 'physical', labelKey: 'cardDetails.stats.physical', icon: 'arm-flex', bgColor: palette.orange[500] },
];

function getStatsWithDefaults(card: CollectionCardType): CardStats {
  const base = card.stats ?? DEFAULT_STATS;
  return { ...DEFAULT_STATS, ...base };
}

const HERO_ENTRANCE_OFFSET = 24;
const STATS_ENTRANCE_OFFSET = 20;

function AnimatedStatBarFill({
  progress,
  targetPercent,
  backgroundColor,
}: {
  progress: SharedValue<number>;
  targetPercent: number;
  backgroundColor: string;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * targetPercent}%`,
    backgroundColor,
  }));
  return <Animated.View style={[styles.statBarFill, animatedStyle]} />;
}

export interface CardDetailsScreenProps {
  card: CollectionCardType;
  /** Similar cards (e.g. from SQLite). When not provided, section is empty. */
  similarCards?: CollectionCardType[];
  onBack: () => void;
  onFoundPress?: () => void;
  onSimilarCardPress?: (card: CollectionCardType) => void;
}

export function CardDetailsScreen({
  card,
  similarCards: similarCardsProp,
  onBack,
  onFoundPress,
  onSimilarCardPress,
}: CardDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);
  const [heroLayout, setHeroLayout] = useState({ width: 0, height: 0 });
  const [fadeWidth, setFadeWidth] = useState(0);
  const stats = getStatsWithDefaults(card);

  const heroBadges = useSharedValue(0);
  const heroColumns = useSharedValue(0);
  const heroCollection = useSharedValue(0);
  const statsSectionEnter = useSharedValue(0);
  const statsFillProgress = useSharedValue(0);

  useEffect(() => {
    heroBadges.value = withDelay(100, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    heroColumns.value = withDelay(220, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    heroCollection.value = withDelay(380, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
  }, []);

  useEffect(() => {
    statsSectionEnter.value = withDelay(150, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    statsFillProgress.value = withDelay(450, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, []);

  const heroBadgesStyle = useAnimatedStyle(() => ({
    opacity: heroBadges.value,
    transform: [{ translateY: (heroBadges.value - 1) * HERO_ENTRANCE_OFFSET }],
  }));
  const heroColumnsStyle = useAnimatedStyle(() => ({
    opacity: heroColumns.value,
    transform: [{ translateY: (heroColumns.value - 1) * HERO_ENTRANCE_OFFSET }],
  }));
  const heroCollectionStyle = useAnimatedStyle(() => ({
    opacity: heroCollection.value,
    transform: [{ translateY: (heroCollection.value - 1) * HERO_ENTRANCE_OFFSET }],
  }));
  const statsSectionStyle = useAnimatedStyle(() => ({
    opacity: statsSectionEnter.value,
    transform: [{ translateY: (statsSectionEnter.value - 1) * STATS_ENTRANCE_OFFSET }],
  }));

  const onHeroLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setHeroLayout({ width, height });
  };

  const similarCards = similarCardsProp ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.heroFixed, { height: HERO_HEIGHT }]}
        onLayout={onHeroLayout}
        pointerEvents="box-none"
      >
        <Image
          source={bgCardDetails}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {heroLayout.width > 0 && heroLayout.height > 0 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Canvas style={{ width: heroLayout.width, height: heroLayout.height }}>
              <Rect x={0} y={0} width={heroLayout.width} height={heroLayout.height}>
                <LinearGradient
                  start={vec(0, heroLayout.height)}
                  end={vec(0, 0)}
                  colors={[colors.background, 'transparent']}
                />
              </Rect>
            </Canvas>
          </View>
        )}

        <View style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}>
          <Pressable
            onPress={onBack}
            style={styles.headerBtn}
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => setIsFavorite(!isFavorite)}
              style={[styles.headerBtn, isFavorite && styles.headerBtnFavorite]}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={colors.text}
              />
            </Pressable>
            <Pressable
              style={styles.headerBtn}
              accessibilityLabel={t('common.share')}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroBottom}>
          
          <Animated.View style={[styles.twoColumns, heroColumnsStyle]}>
            
            <View style={styles.leftColumn}>
            <Animated.View style={[styles.badgesRowWrap, heroBadgesStyle]}>
              <View style={styles.badgesRow}>
                <View style={styles.rarityBadge}>
                  <Ionicons name="star" size={14} color={colors.text} />
                  <Text style={styles.rarityText}>{card.rarity}</Text>
                </View>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{card.position ?? '—'}</Text>
                </View>
                <View style={styles.ovrBadge}>
                  <Text style={styles.ovrBadgeText}>{card.rating}</Text>
                </View>
              </View>
            </Animated.View>
              <Text numberOfLines={1} style={styles.playerName}>{card.player}</Text>
              <Text style={styles.teamName}>{card.team}</Text>
            </View>
            <View style={styles.heroArtworkWrap}>
              <CardArtwork
                uri={card.image}
                style={styles.heroArtwork}
                pointerEvents="none"
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.collectionCardWrap, heroCollectionStyle]}>
            <CardFoundProgress
              foundCount={card.foundCount}
              totalCount={card.totalCount}
              onPress={onFoundPress}
            />
          </Animated.View>
        </View>
      </View>

      <View
        style={[styles.listFade, { top: HERO_HEIGHT }]}
        pointerEvents="none"
        onLayout={(e) => setFadeWidth(e.nativeEvent.layout.width)}
      >
        {fadeWidth > 0 && (
          <Canvas style={{ width: fadeWidth, height: LIST_FADE_HEIGHT }}>
            <Rect x={0} y={0} width={fadeWidth} height={LIST_FADE_HEIGHT}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, LIST_FADE_HEIGHT)}
                colors={[colors.background, 'transparent']}
              />
            </Rect>
          </Canvas>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HERO_HEIGHT,
            paddingBottom: 24 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.section, statsSectionStyle]}>
          <Text style={styles.sectionTitle}>{t('cardDetails.statisticsTitle')}</Text>
          <View style={styles.statsList}>
            {STAT_CONFIG.map((config) => (
              <View key={config.key} style={styles.statCard}>
                <View style={styles.statRowTop}>
                  <View style={[styles.statIconWrap, { backgroundColor: config.bgColor + '33' }]}>
                    <MaterialCommunityIcons name={config.icon} size={20} color={config.bgColor} />
                  </View>
                  <Text style={styles.statLabel}>{t(config.labelKey)}</Text>
                  <Text style={styles.statValue}>{stats[config.key]}</Text>
                </View>
                <View style={styles.statBarTrack}>
                  <AnimatedStatBarFill
                    progress={statsFillProgress}
                    targetPercent={stats[config.key]}
                    backgroundColor={config.bgColor}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cardDetails.similarTitle')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarScroll}
          >
            {similarCards.map((c) => (
              <Pressable
                key={c.id}
                style={styles.similarCard}
                onPress={() => onSimilarCardPress?.(c)}
              >
                <View style={styles.similarImageWrap}>
                  <Image source={{ uri: c.image }} style={styles.similarImage} contentFit="cover" />
                  <View style={styles.similarRatingBadge}>
                    <Text style={styles.similarRatingText}>{c.rating}</Text>
                  </View>
                </View>
                <Text style={styles.similarPlayerName} numberOfLines={1}>{c.player}</Text>
                <Text style={styles.similarTeamName}>{c.team}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{t('cardDetails.tradeButton')}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>{t('cardDetails.viewMarketButton')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnFavorite: {
    backgroundColor: colors.destructive + '80',
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBottom: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'column',
    zIndex: 10,
    paddingTop: 32,
  },
  badgesRowWrap: {
    marginBottom: 12,
  },
  twoColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  leftColumn: {
    flex: 1,
    minWidth: 0,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.amber[500],
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  positionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  ovrBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  ovrBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  playerName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 40,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  heroArtworkWrap: {
    width: HERO_ARTWORK_WIDTH,
    height: HERO_ARTWORK_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroArtwork: {
    width: HERO_ARTWORK_WIDTH,
    height: HERO_ARTWORK_HEIGHT,
  },
  collectionCardWrap: {
    width: '100%',
  },
  listFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: LIST_FADE_HEIGHT,
    zIndex: 6,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsList: {
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    padding: 16,
  },
  statRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  similarScroll: {
    gap: 12,
    paddingRight: 16,
  },
  similarCard: {
    width: 128,
  },
  similarImageWrap: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cardBorder,
    marginBottom: 8,
  },
  similarImage: {
    width: '100%',
    height: '100%',
  },
  similarRatingBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  similarPlayerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  similarTeamName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryLight,
  },
});
