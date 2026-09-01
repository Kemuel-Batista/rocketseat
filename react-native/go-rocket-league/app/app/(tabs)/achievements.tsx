import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildTeamShieldUri, resolveCardImageUri } from '@/lib/api/cardImageUri';
import { getUserTeam, type UserTeamDto } from '@/lib/api/userTeamApi';
import { useUserStore } from '@/store/userStore';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

const PLACEHOLDER_ACHIEVEMENTS = [
  { id: 't1', titleKey: 'achievements.placeholderTeam1', descKey: 'achievements.placeholderTeam1Desc' },
  { id: 't2', titleKey: 'achievements.placeholderTeam2', descKey: 'achievements.placeholderTeam2Desc' },
];

const PLACEHOLDER_INDIVIDUAL = [
  { id: 'i1', titleKey: 'achievements.placeholderInd1', descKey: 'achievements.placeholderInd1Desc' },
  { id: 'i2', titleKey: 'achievements.placeholderInd2', descKey: 'achievements.placeholderInd2Desc' },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const battleAvailable = useUserStore((s) => s.battleAvailable);
  const battleStakeTier = useUserStore((s) => s.battleStakeTier);
  const [team, setTeam] = useState<UserTeamDto | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    setLoadingTeam(true);
    setTeamError(null);
    try {
      const data = await getUserTeam();
      setTeam(data);
    } catch (e) {
      setTeam(null);
      setTeamError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTeam();
    }, [loadTeam])
  );

  const goEditTeam = useCallback(() => {
    router.push('/edit-team');
  }, [router]);
  const goChallenges = useCallback(() => {
    router.push('/challenges');
  }, [router]);

  const teamCardArtUri = useMemo(() => {
    if (!team) return undefined;
    if (team.shieldId != null && team.shieldId > 0) {
      return buildTeamShieldUri(team.shieldId);
    }
    const fromShieldUrl = resolveCardImageUri(team.shieldUrl ?? null);
    if (fromShieldUrl) return fromShieldUrl;
    return resolveCardImageUri(team.slots?.[0]?.instance?.card?.url);
  }, [team]);

  const stakeCoins = useMemo(() => {
    const map: Record<string, number> = {
      COINS_10: 10,
      COINS_50: 50,
      COINS_100: 100,
      COINS_1000: 1000,
    };
    return map[String(battleStakeTier)] ?? 0;
  }, [battleStakeTier]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{t('achievements.title')}</Text>
        <Text style={styles.subtitle}>{t('achievements.subtitle')}</Text>
      </View>

      <Pressable
        onPress={goEditTeam}
        style={({ pressed }) => [styles.teamCard, pressed && styles.teamCardPressed]}
      >
        <View style={styles.teamCardInner}>
          <View style={styles.teamCardIconWrap}>
            {loadingTeam ? (
              <ActivityIndicator color={colors.primaryLight} />
            ) : teamCardArtUri ? (
              <Image
                source={{ uri: teamCardArtUri }}
                style={styles.teamCardThumb}
                contentFit="contain"
              />
            ) : (
              <Ionicons name="people" size={28} color={colors.primaryLight} />
            )}
          </View>
          <View style={styles.teamCardText}>
            <Text style={styles.teamCardLabel}>{t('achievements.myTeamCardTitle')}</Text>
            {teamError && !loadingTeam ? (
              <Text style={styles.teamCardError} numberOfLines={2}>
                {teamError}
              </Text>
            ) : team ? (
              <>
                <Text style={styles.teamCardName} numberOfLines={1}>
                  {team.name}
                </Text>
                <Text style={styles.teamCardStats}>
                  {t('achievements.teamOverallRecord', {
                    overall: team.overall,
                    wins: team.wins,
                    losses: team.losses,
                  })}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.teamCardName}>{t('achievements.noTeamTitle')}</Text>
                <Text style={styles.teamCardHint}>{t('achievements.noTeamSubtitle')}</Text>
              </>
            )}
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </View>
        <Text style={styles.teamCardFooter}>{t('achievements.myTeamCardHint')}</Text>
        {battleAvailable && stakeCoins > 0 && (
          <View style={styles.battleBadgeRow}>
            <Ionicons name="flash" size={14} color={palette.yellow[400]} />
            <Text style={styles.battleBadgeText}>
              {t('achievements.battleAvailableLine', { coins: stakeCoins })}
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={goChallenges}
        style={({ pressed }) => [styles.challengeCard, pressed && styles.teamCardPressed]}
      >
        <View style={styles.teamCardInner}>
          <View style={[styles.teamCardIconWrap, styles.challengeIconWrap]}>
            <Ionicons name="flash-outline" size={26} color={colors.secondaryLight} />
          </View>
          <View style={styles.teamCardText}>
            <Text style={styles.teamCardLabel}>{t('achievements.challengesCardLabel')}</Text>
            <Text style={styles.teamCardName} numberOfLines={1}>
              {t('achievements.challengesCardTitle')}
            </Text>
            <Text style={styles.teamCardStats} numberOfLines={2}>
              {t('achievements.challengesCardSubtitle')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </View>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: colors.successLight }]}>
            {team ? `${team.wins}V · ${team.losses}D` : '—'}
          </Text>
          <Text style={styles.statLabel}>{t('achievements.statTeamRecord')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: colors.secondaryLight }]}>0/0</Text>
          <Text style={styles.statLabel}>{t('achievements.statTeamAchievements')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: colors.primaryLight }]}>0%</Text>
          <Text style={styles.statLabel}>{t('achievements.statIndividual')}</Text>
        </View>
      </View>

      <Text style={styles.sectionHeading}>{t('achievements.teamSectionTitle')}</Text>
      {PLACEHOLDER_ACHIEVEMENTS.map((item, index) => (
        <View
          key={item.id}
          style={[styles.achievementCard, index === 0 && styles.achievementCardFirst]}
        >
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy-outline" size={26} color={colors.textDisabled} />
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.textDisabled} />
            </View>
          </View>
          <View style={styles.achievementBody}>
            <Text style={styles.achievementTitleMuted}>{t(item.titleKey)}</Text>
            <Text style={styles.achievementDescMuted}>{t(item.descKey)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.rewardTag}>{t('achievements.placeholderReward')}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>
        {t('achievements.individualSectionTitle')}
      </Text>
      {PLACEHOLDER_INDIVIDUAL.map((item, index) => (
        <View
          key={item.id}
          style={[styles.achievementCard, index === 0 && styles.achievementCardFirst]}
        >
          <View style={styles.achievementIcon}>
            <Ionicons name="person-outline" size={26} color={colors.textDisabled} />
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.textDisabled} />
            </View>
          </View>
          <View style={styles.achievementBody}>
            <Text style={styles.achievementTitleMuted}>{t(item.titleKey)}</Text>
            <Text style={styles.achievementDescMuted}>{t(item.descKey)}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.rewardTag}>{t('achievements.placeholderReward')}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  teamCardPressed: {
    opacity: 0.92,
  },
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 14,
  },
  challengeIconWrap: {
    backgroundColor: palette.purple[700] + '33',
    borderColor: palette.purple[400] + '44',
  },
  teamCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamCardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: palette.cyan[800] + '55',
    borderWidth: 1,
    borderColor: palette.cyan[500] + '44',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  teamCardThumb: {
    width: '100%',
    height: '100%',
  },
  teamCardText: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  teamCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  teamCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  teamCardStats: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  teamCardHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  teamCardError: {
    fontSize: 12,
    color: colors.destructiveLight,
    marginTop: 4,
  },
  teamCardFooter: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 12,
  },
  battleBadgeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${palette.yellow[400]}55`,
    backgroundColor: palette.yellow[900],
  },
  battleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.yellow[400],
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: -4,
  },
  statCell: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHeadingSpaced: {
    marginTop: 8,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  achievementCardFirst: {
    marginTop: 0,
  },
  achievementIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.slate[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  achievementBody: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitleMuted: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDisabled,
  },
  achievementDescMuted: {
    fontSize: 13,
    color: colors.textDisabled,
    marginTop: 4,
    opacity: 0.85,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: palette.cyan[500],
  },
  rewardTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDisabled,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.slate[800],
  },
});
