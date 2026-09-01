import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardArtwork } from '@/components/CardArtwork';
import { useToast } from '@/components/toast/ToastContainer';
import { getUserTeam } from '@/lib/api/userTeamApi';
import {
  acceptTrade,
  cancelTrade,
  declineTrade,
  getTrades,
  type TradeProposal,
} from '@/lib/api/tradesApi';
import { useUserStore } from '@/store/userStore';
import { colors } from '@/theme';
import { t } from '@/i18n';

function renderTradeInstances(instances: TradeProposal['offerFromInitiator']) {
  const content = instances.map((instance) => {
    const serial = instance.serialLabel ?? `${instance.serialNumber}/${instance.serialMax}`;
    const nation = instance.card?.nation ?? '—';
    const ovr = instance.card?.ovr ?? 0;
    return (
      <View
        key={instance.id}
        style={[styles.instanceCard, instances.length === 1 && styles.instanceCardFull]}
      >
        <CardArtwork uri={instance.card?.url ?? ''} style={styles.instanceImage} pointerEvents="none" />
        <View style={styles.instanceBody}>
          <Text style={styles.instanceName} numberOfLines={1}>
            {instance.card?.name ?? t('trades.unknownCard')}
          </Text>
          <View style={styles.instanceMetaRow}>
            <Text style={styles.instanceMeta}>{t('trades.serialLine', { serial })}</Text>
            <View style={styles.instanceOvrBadge}>
              <Text style={styles.instanceOvrText}>{ovr}</Text>
            </View>
          </View>
          <Text style={styles.instanceNation}>{nation}</Text>
        </View>
      </View>
    );
  });

  if (instances.length > 1) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.instancesRow}>
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.instancesSingleWrap}>{content}</View>;
}

export default function TradesScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const username = useUserStore((s) => s.username);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<TradeProposal[]>([]);
  const [starterIds, setStarterIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED'>('PENDING');

  const loadTrades = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [res, team] = await Promise.all([
        getTrades({ role: 'all', take: 50, skip: 0 }),
        getUserTeam(),
      ]);
      setItems(res.items);
      const starters = new Set(
        (team?.slots ?? []).map((slot) => slot.instance?.id).filter((id): id is string => !!id)
      );
      setStarterIds(starters);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('trades.loadTradesError'));
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrades(false);
    }, [loadTrades])
  );

  const pendingCount = useMemo(
    () => items.filter((t) => t.status === 'PENDING').length,
    [items]
  );
  const acceptedCount = useMemo(
    () => items.filter((t) => t.status === 'ACCEPTED').length,
    [items]
  );
  const declinedCount = useMemo(
    () => items.filter((t) => t.status === 'DECLINED').length,
    [items]
  );
  const cancelledCount = useMemo(
    () => items.filter((t) => t.status === 'CANCELLED').length,
    [items]
  );
  const visibleItems = useMemo(
    () => items.filter((item) => item.status === statusFilter),
    [items, statusFilter]
  );

  const executeAction = async (
    trade: TradeProposal,
    action: 'accept' | 'decline' | 'cancel'
  ) => {
    if (action === 'accept') {
      const hasStarterInTrade = trade.offerFromCounterparty.some((instance) =>
        starterIds.has(instance.id)
      );
      if (hasStarterInTrade) {
        toast.showWarning(t('trades.acceptBlockedStarter'));
        return;
      }
    }

    setBusyId(trade.id);
    try {
      if (action === 'accept') await acceptTrade(trade.id);
      if (action === 'decline') await declineTrade(trade.id);
      if (action === 'cancel') await cancelTrade(trade.id);
      await loadTrades(false);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : t('trades.actionError'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('trades.title')}</Text>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{t('trades.pendingCount', { count: pendingCount })}</Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => setStatusFilter('PENDING')}
          style={[
            styles.filterCard,
            statusFilter === 'PENDING' ? styles.filterCardPendingActive : styles.filterCardIdle,
          ]}
        >
          <Text
            style={[
              styles.filterLabel,
              statusFilter === 'PENDING' ? styles.filterLabelPendingActive : styles.filterLabelIdle,
            ]}
          >
            {t('trades.pending')}
          </Text>
          <Text
            style={[
              styles.filterValue,
              statusFilter === 'PENDING' ? styles.filterValuePendingActive : styles.filterValueIdle,
            ]}
          >
            {pendingCount}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStatusFilter('ACCEPTED')}
          style={[
            styles.filterCard,
            statusFilter === 'ACCEPTED' ? styles.filterCardAcceptedActive : styles.filterCardIdle,
          ]}
        >
          <Text
            style={[
              styles.filterLabel,
              statusFilter === 'ACCEPTED' ? styles.filterLabelAcceptedActive : styles.filterLabelIdle,
            ]}
          >
            {t('trades.accepted')}
          </Text>
          <Text
            style={[
              styles.filterValue,
              statusFilter === 'ACCEPTED' ? styles.filterValueAcceptedActive : styles.filterValueIdle,
            ]}
          >
            {acceptedCount}
          </Text>
        </Pressable>
      </View>
      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => setStatusFilter('DECLINED')}
          style={[
            styles.filterCard,
            statusFilter === 'DECLINED' ? styles.filterCardDeclinedActive : styles.filterCardIdle,
          ]}
        >
          <Text
            style={[
              styles.filterLabel,
              statusFilter === 'DECLINED' ? styles.filterLabelDeclinedActive : styles.filterLabelIdle,
            ]}
          >
            {t('trades.declined')}
          </Text>
          <Text
            style={[
              styles.filterValue,
              statusFilter === 'DECLINED' ? styles.filterValueDeclinedActive : styles.filterValueIdle,
            ]}
          >
            {declinedCount}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setStatusFilter('CANCELLED')}
          style={[
            styles.filterCard,
            statusFilter === 'CANCELLED' ? styles.filterCardCancelledActive : styles.filterCardIdle,
          ]}
        >
          <Text
            style={[
              styles.filterLabel,
              statusFilter === 'CANCELLED' ? styles.filterLabelCancelledActive : styles.filterLabelIdle,
            ]}
          >
            {t('trades.cancelled')}
          </Text>
          <Text
            style={[
              styles.filterValue,
              statusFilter === 'CANCELLED' ? styles.filterValueCancelledActive : styles.filterValueIdle,
            ]}
          >
            {cancelledCount}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadTrades(false)}>
            <Text style={styles.retryText}>{t('collection.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTrades(true)}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => {
            const isMine = item.initiator.username === username;
            const canAcceptOrDecline = item.status === 'PENDING' && !isMine;
            const canCancel = item.status === 'PENDING' && isMine;
            const hasStarterInTrade = item.offerFromCounterparty.some((instance) =>
              starterIds.has(instance.id)
            );
            const offeredInstances = isMine ? item.offerFromInitiator : item.offerFromCounterparty;
            const receivedInstances = isMine ? item.offerFromCounterparty : item.offerFromInitiator;
            const firstSectionLabel = isMine ? t('trades.youOffer') : t('trades.youReceive');
            const firstSectionItems = isMine ? offeredInstances : receivedInstances;
            const secondSectionLabel = isMine ? t('trades.youReceive') : t('trades.youOffer');
            const secondSectionItems = isMine ? receivedInstances : offeredInstances;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.status}>{item.status}</Text>
                  <Text style={styles.sideInfo}>
                    {isMine
                      ? t('trades.toUser', { username: item.counterparty.username })
                      : t('trades.fromUser', { username: item.initiator.username })}
                  </Text>
                </View>

                <View style={styles.instancesSection}>
                  <Text style={styles.instancesLabel}>{firstSectionLabel}</Text>
                  {renderTradeInstances(firstSectionItems)}
                </View>

                <View style={styles.swapMidWrap}>
                  <View style={styles.swapMidIcon}>
                    <Ionicons name="swap-vertical" size={15} color={colors.primaryLight} />
                  </View>
                </View>

                <View style={styles.instancesSection}>
                  <Text style={styles.instancesLabel}>{secondSectionLabel}</Text>
                  {renderTradeInstances(secondSectionItems)}
                </View>

                {(canAcceptOrDecline || canCancel) && (
                  <View style={styles.actions}>
                    {canAcceptOrDecline ? (
                      <>
                        <Pressable
                          onPress={() => executeAction(item, 'decline')}
                          disabled={busyId === item.id}
                          style={[styles.btn, styles.btnDanger]}
                        >
                          <Text style={styles.btnText}>{t('trades.decline')}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => executeAction(item, 'accept')}
                          disabled={busyId === item.id || hasStarterInTrade}
                          style={[
                            styles.btn,
                            styles.btnPrimary,
                            hasStarterInTrade && styles.btnDisabled,
                          ]}
                        >
                          <Text style={styles.btnText}>{t('trades.accept')}</Text>
                        </Pressable>
                      </>
                    ) : null}
                    {canCancel ? (
                      <Pressable
                        onPress={() => executeAction(item, 'cancel')}
                        disabled={busyId === item.id}
                        style={[styles.btn, styles.btnNeutral]}
                      >
                        <Text style={styles.btnText}>{t('trades.cancelProposal')}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
                {hasStarterInTrade && canAcceptOrDecline ? (
                  <Text style={styles.warningText}>{t('trades.acceptBlockedStarter')}</Text>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {statusFilter === 'PENDING'
                  ? t('trades.emptyPending')
                  : statusFilter === 'ACCEPTED'
                    ? t('trades.emptyAccepted')
                    : statusFilter === 'DECLINED'
                      ? t('trades.emptyDeclined')
                      : t('trades.emptyCancelled')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  counterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
  },
  filterCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterCardIdle: {
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  filterCardPendingActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primary + '2E',
  },
  filterCardAcceptedActive: {
    borderColor: colors.successLight,
    backgroundColor: colors.success + '2E',
  },
  filterCardDeclinedActive: {
    borderColor: colors.destructiveLight,
    backgroundColor: colors.destructive + '2E',
  },
  filterCardCancelledActive: {
    borderColor: colors.accentLight,
    backgroundColor: colors.accent + '2E',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  filterLabelIdle: {
    color: colors.textMuted,
  },
  filterLabelPendingActive: {
    color: colors.primaryLight,
  },
  filterLabelAcceptedActive: {
    color: colors.success,
  },
  filterLabelDeclinedActive: {
    color: colors.destructive,
  },
  filterLabelCancelledActive: {
    color: colors.accentLight,
  },
  filterValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  filterValueIdle: {
    color: colors.text,
  },
  filterValuePendingActive: {
    color: colors.primaryLight,
  },
  filterValueAcceptedActive: {
    color: colors.successLight,
  },
  filterValueDeclinedActive: {
    color: colors.destructiveLight,
  },
  filterValueCancelledActive: {
    color: colors.accentLight,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: colors.text,
    fontWeight: '700',
  },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    backgroundColor: colors.card,
    padding: 12,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  sideInfo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnDanger: {
    backgroundColor: colors.destructive,
  },
  btnNeutral: {
    backgroundColor: colors.hudCardBackground,
  },
  btnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  warningText: {
    fontSize: 12,
    color: colors.destructive,
    fontWeight: '700',
  },
  instancesSection: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  instancesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  instancesRow: {
    gap: 8,
    paddingRight: 2,
  },
  instancesSingleWrap: {
    width: '100%',
  },
  instanceCard: {
    width: 188,
    borderWidth: 1,
    borderColor: colors.primary + '66',
    borderRadius: 10,
    backgroundColor: colors.hudCardBackground + 'CC',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instanceCardFull: {
    width: '100%',
  },
  instanceImage: {
    width: 40,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.cardBorder,
  },
  instanceBody: {
    flex: 1,
    minWidth: 0,
  },
  instanceName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  instanceMeta: {
    fontSize: 11,
    color: colors.textMuted,
  },
  instanceMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  instanceOvrBadge: {
    minWidth: 28,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '99',
    backgroundColor: colors.primary + '2B',
  },
  instanceOvrText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  instanceNation: {
    marginTop: 2,
    fontSize: 11,
    color: colors.primaryLight,
  },
  swapMidWrap: {
    alignItems: 'center',
  },
  swapMidIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.primary + '66',
    backgroundColor: colors.primary + '17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
});
