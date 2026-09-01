import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buildTeamShieldUri, resolveCardImageUri } from '@/lib/api/cardImageUri';
import { instantOpenBattle } from '@/lib/api/battlesApi';
import {
  getTeamsLeaderboardOpenForBattle,
  type OpenBattleTeamRow,
} from '@/lib/api/userTeamApi';
import { WinnerReveal } from '@/components/battle/WinnerReveal';
import { useToast } from '@/components/toast/ToastContainer';
import { MOCK_WINNER_REVEAL, MOCK_WINNER_REVEAL_LOSER } from '@/lib/battle/battleRevealMock';
import { mapInstantOpenToRevealContent } from '@/lib/battle/mapInstantOpenResponse';
import type { WinnerRevealContent } from '@/lib/battle/battleRevealTypes';
import { useUserStore } from '@/store/userStore';
import { colors, palette } from '@/theme';
import { t } from '@/i18n';

type OpponentRow = {
  userId: string;
  username: string;
  teamName: string;
  stakeTier: OpenBattleTeamRow['stakeTier'];
  stakeCoins: number;
  shieldId: number | null;
  shieldUrl: string | null;
};

function totalCoins(stakeCoins: number): number {
  return Math.max(0, Math.floor(stakeCoins)) * 2;
}

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const coinBalance = useUserStore((s) => s.coinBalance);
  const setCoinBalance = useUserStore((s) => s.setCoinBalance);
  const myUserId = useUserStore((s) => s.userId);
  const [loading, setLoading] = useState(true);
  const [opponents, setOpponents] = useState<OpponentRow[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [winnerRevealPayload, setWinnerRevealPayload] = useState<WinnerRevealContent | null>(null);

  const closeWinnerReveal = useCallback(() => setWinnerRevealPayload(null), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTeamsLeaderboardOpenForBattle()
      .then((items) => {
        if (!alive) return;
        const filtered =
          myUserId != null
            ? (items ?? []).filter((it) => String(it.userId) !== String(myUserId))
            : (items ?? []);
        const rows: OpponentRow[] = filtered.map((it) => ({
          userId: String(it.userId),
          username: String(it.username ?? '').trim() || t('battles.unknownUser'),
          teamName: String(it.teamName ?? '').trim() || t('battles.unknownTeam'),
          stakeTier: it.stakeTier,
          stakeCoins: Number(it.stakeCoins ?? 0),
          shieldId: it.shieldId ?? null,
          shieldUrl: it.shieldUrl ?? null,
        }));
        setOpponents(rows);
      })
      .catch((e) => {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : String(e);
        toast.showToast({ type: 'error', title: t('battles.loadErrorTitle'), message: msg });
        setOpponents([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [toast, myUserId]);

  const goBack = useCallback(() => router.back(), [router]);

  const onPressDuel = useCallback(
    async (opponent: OpponentRow) => {
      if (sendingId) return;
      const stake = Math.max(0, Math.floor(opponent.stakeCoins));
      if (!stake) return;
      if (coinBalance < stake) {
        toast.showToast({
          type: 'warning',
          title: t('battles.insufficientCoinsTitle'),
          message: t('battles.insufficientCoinsMessage', { coins: stake, balance: coinBalance }),
        });
        return;
      }
      setSendingId(opponent.userId);
      try {
        const res = await instantOpenBattle({
          opponentUserId: opponent.userId,
          stakeTier: opponent.stakeTier,
        });
        setCoinBalance(res.self.walletBalanceAfter);
        setOpponents((prev) => prev.filter((p) => p.userId !== opponent.userId));
        const reveal = mapInstantOpenToRevealContent(res);
        if (reveal) {
          setWinnerRevealPayload(reveal);
        } else {
          const won = String(res.self?.result ?? '').toLowerCase() === 'win';
          toast.showToast({
            type: won ? 'success' : 'warning',
            title: won ? t('battles.instantWinTitle') : t('battles.instantLoseTitle'),
            message: t('battles.instantResultMessage', {
              xp: res.self.xpGained,
              balance: res.self.walletBalanceAfter,
            }),
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.showToast({ type: 'error', title: t('battles.errorTitle'), message: msg });
      } finally {
        setSendingId(null);
      }
    },
    [coinBalance, sendingId, setCoinBalance, toast]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t('battles.challengesTitle')}</Text>
        <View style={styles.topRight} />
      </View>

      <View style={styles.headerCard}>
        <Text style={styles.headerLine}>{t('battles.balanceLine', { balance: coinBalance })}</Text>
        <Text style={styles.headerHint}>{t('battles.challengesSubtitle')}</Text>
      </View>

      {winnerRevealPayload != null ? (
        <WinnerReveal visible onClose={closeWinnerReveal} content={winnerRevealPayload} />
      ) : null}

      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>{t('battles.opponentsTitle', { count: opponents.length })}</Text>
      </View>

      <FlatList
        data={opponents}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('battles.noOpponentsTitle')}</Text>
            <Text style={styles.emptySubtitle}>{t('battles.noOpponentsSubtitle')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const shieldUri =
            item.shieldId != null && item.shieldId > 0
              ? buildTeamShieldUri(item.shieldId)
              : resolveCardImageUri(item.shieldUrl);
          const isSending = sendingId === item.userId;
          const stake = Math.max(0, Math.floor(item.stakeCoins));
          const total = totalCoins(stake);
          const afford = coinBalance >= stake;
          return (
            <View style={styles.opponentRow}>
              <View style={styles.opponentLeft}>
                <View style={styles.shieldWrap}>
                  {shieldUri ? (
                    <Image source={{ uri: shieldUri }} style={styles.shieldImg} contentFit="contain" />
                  ) : (
                    <View style={styles.shieldPlaceholder}>
                      <Ionicons name="shield-outline" size={22} color={colors.textMuted} />
                    </View>
                  )}
                </View>
                <View style={styles.opponentMeta}>
                  <Text style={styles.opponentName} numberOfLines={1}>
                    {item.teamName}
                  </Text>
                  <Text style={styles.opponentSub}>
                    {t('battles.teamRowSubtitle', { username: item.username })}
                  </Text>
                  <View style={styles.amountRow}>
                    <Image source={require('@/assets/coin.png')} style={styles.amountCoinIcon} />
                    <Text style={styles.amountText}>
                      {t('battles.teamRowAmount', { stake, total })}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={() => onPressDuel(item)}
                disabled={isSending || !afford}
                style={({ pressed }) => [
                  styles.duelBtn,
                  (!afford || isSending) && styles.duelBtnDisabled,
                  pressed && afford && !isSending && styles.duelBtnPressed,
                ]}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.primaryLight} />
                ) : (
                  <>
                    <Ionicons name="flash" size={16} color={colors.primaryLight} />
                    <Text style={styles.duelBtnText}>{t('battles.duelCta')}</Text>
                  </>
                )}
              </Pressable>
            </View>
          );
        }}
        ListHeaderComponent={loading ? <ActivityIndicator style={{ paddingTop: 10 }} color={colors.textMuted} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  topRight: { width: 44, height: 44 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: colors.text },

  headerCard: {
    margin: 16,
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerLine: { fontSize: 13, fontWeight: '800', color: colors.primaryLight },
  headerHint: { marginTop: 6, fontSize: 12, color: colors.textMuted },
  previewRevealRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  previewRevealBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.purple[500] + '66',
    backgroundColor: palette.purple[900] + '44',
  },
  previewRevealBtnLose: {
    borderColor: palette.red[500] + '66',
    backgroundColor: palette.red[900] + '88',
  },
  previewRevealBtnPressed: { opacity: 0.88 },
  previewRevealText: { fontSize: 12, fontWeight: '700', color: colors.primaryLight, textAlign: 'center' },
  previewRevealTextLose: { fontSize: 12, fontWeight: '700', color: palette.red[400], textAlign: 'center' },

  listHeaderRow: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },

  empty: { marginTop: 22, padding: 18, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '800', color: colors.text },
  emptySubtitle: { marginTop: 6, fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    gap: 12,
  },
  opponentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  shieldWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: palette.slate[800],
  },
  shieldImg: { width: '100%', height: '100%' },
  shieldPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  opponentMeta: { flex: 1 },
  opponentName: { fontSize: 15, fontWeight: '800', color: colors.text },
  opponentSub: { marginTop: 2, fontSize: 12, color: colors.textMuted },
  amountRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountCoinIcon: { width: 14, height: 14 },
  amountText: { fontSize: 12, fontWeight: '800', color: palette.yellow[400] },

  duelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.cyan[500] + '80',
    backgroundColor: palette.cyan[500] + '26',
  },
  duelBtnPressed: { opacity: 0.86 },
  duelBtnDisabled: { opacity: 0.45 },
  duelBtnText: { fontSize: 13, fontWeight: '800', color: colors.primaryLight },
});

