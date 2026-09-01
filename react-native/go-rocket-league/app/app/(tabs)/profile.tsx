import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStatCard } from '@/components/ProfileStatCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { t } from '@/i18n';
import { apiConfig } from '@/lib/api/config';
import { useCoverage } from '@/lib/coverage/useCoverage';
import { useUserStore } from '@/store/userStore';
import { colors } from '@/theme';

const ENTRANCE_OFFSET = 20;
const ENTRANCE_DURATION = 400;
const CARD_DELAY = 100;
const STATS_DELAY = 200;

const USER_STAT_KEYS = [
  {
    icon: 'star' as const,
    labelKey: 'profile.statTotalCards' as const,
    value: '6',
    valueKey: undefined,
    backgroundColor: colors.statCardTotalCardsBg,
    iconColor: colors.statCardTotalCardsIcon,
  },
  {
    icon: 'trophy' as const,
    labelKey: 'profile.statAchievements' as const,
    value: '1',
    valueKey: undefined,
    backgroundColor: colors.statCardAchievementsBg,
    iconColor: colors.statCardAchievementsIcon,
  },
  {
    icon: 'lightning-bolt' as const,
    labelKey: 'profile.statTotalXp' as const,
    value: '0',
    valueKey: 'xp' as const,
    backgroundColor: colors.statCardTotalXpBg,
    iconColor: colors.statCardTotalXpIcon,
  },
  {
    icon: 'map-marker' as const,
    labelKey: 'profile.statLocations' as const,
    value: '0',
    valueKey: 'coverage' as const,
    backgroundColor: colors.statCardLocationsBg,
    iconColor: colors.statCardLocationsIcon,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const username = useUserStore((s) => s.username);
  const avatarId = useUserStore((s) => s.avatarId);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const { coverageCount } = useCoverage();

  const headerEntrance = useSharedValue(0);
  const cardEntrance = useSharedValue(0);
  const statsEntrance = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      headerEntrance.value = 0;
      cardEntrance.value = 0;
      statsEntrance.value = 0;
      const config = { duration: ENTRANCE_DURATION, easing: Easing.out(Easing.cubic) };
      headerEntrance.value = withTiming(1, config);
      cardEntrance.value = withDelay(CARD_DELAY, withTiming(1, config));
      statsEntrance.value = withDelay(STATS_DELAY, withTiming(1, config));
    }, [headerEntrance, cardEntrance, statsEntrance])
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(headerEntrance.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(headerEntrance.value, [0, 1], [-ENTRANCE_OFFSET, 0]) },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cardEntrance.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(cardEntrance.value, [0, 1], [-ENTRANCE_OFFSET, 0]) },
    ],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(statsEntrance.value, [0, 1], [0, 1]),
    transform: [
      { translateY: interpolate(statsEntrance.value, [0, 1], [-ENTRANCE_OFFSET, 0]) },
    ],
  }));

  const displayName = username ?? t('profile.guest');
  const xpFormatted = xp.toLocaleString();
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';
  const avatarUri =
    avatarId != null && avatarId !== 0
      ? `${apiConfig.baseUrl}/public_assets/avatars/${avatarId}.webp`
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View>
            <Text style={styles.title}>{t('profile.title')}</Text>
            <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, cardAnimatedStyle]}>
          <View style={styles.profileCardInner}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, !avatarUri && { backgroundColor: colors.primary }]}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                )}
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{level}</Text>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{displayName}</Text>
                <Pressable
                  onPress={() => router.push('/edit-profile')}
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                >
                  <IconSymbol name="pencil-outline" size={14} color={colors.textMuted} />
                </Pressable>
              </View>
              <Text style={styles.levelText}>{t('profile.levelExplorer', { level })}</Text>
              <View style={styles.friendsRow}>
                <View style={styles.friendAvatars}>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.friendDot, i === 1 && styles.friendDotFirst]} />
                  ))}
                </View>
                <Text style={styles.friendsLabel}>{t('profile.friendsCount', { count: 3 })}</Text>
              </View>
            </View>

            {/* Share */}
            <Pressable
              style={({ pressed }) => [
                styles.shareButton,
                pressed && styles.shareButtonPressed,
              ]}
            >
              <Ionicons name="share-social-outline" size={22} color={colors.primaryLight} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsGrid, statsAnimatedStyle]}>
          {USER_STAT_KEYS.map((stat, index) => {
            const value =
              stat.valueKey === 'xp'
                ? xpFormatted
                : stat.valueKey === 'coverage'
                  ? String(coverageCount)
                  : stat.value;
            return (
              <View key={index} style={styles.statCardWrapper}>
                <ProfileStatCard
                  backgroundColor={stat.backgroundColor}
                  iconColor={stat.iconColor}
                  icon={stat.icon}
                  value={value}
                  label={t(stat.labelKey)}
                />
              </View>
            );
          })}
        </Animated.View>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonPressed: {
    opacity: 0.8,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    backgroundColor: colors.profileCardBackground,
    borderWidth: 1,
    borderColor: colors.profileCardBorder,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.profileCardButtonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonPressed: {
    opacity: 0.8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
    marginBottom: 8,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendAvatars: {
    flexDirection: 'row',
  },
  friendDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -8,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  friendDotFirst: {
    marginLeft: 0,
  },
  friendsLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.profileCardButtonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonPressed: {
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
    minWidth: '47%',
  },
});
