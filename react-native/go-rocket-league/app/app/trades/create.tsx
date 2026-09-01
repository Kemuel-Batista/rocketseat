import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardArtwork } from '@/components/CardArtwork';
import { useToast } from '@/components/toast/ToastContainer';
import { getUserTeam } from '@/lib/api/userTeamApi';
import { fetchAllUserInstances } from '@/lib/api/userInstancesApi';
import { createTrade } from '@/lib/api/tradesApi';
import { mapUserInstanceToCollectionItem, type CollectionItem } from '@/lib/collection/mapUserInstance';
import { colors } from '@/theme';
import { t } from '@/i18n';

export default function CreateTradeRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{
    counterpartyId?: string;
    counterpartyUsername?: string;
    requestInstanceId?: string;
    requestSerialLabel?: string;
    requestPlayerName?: string;
    requestPlayerImage?: string;
    requestPlayerOvr?: string;
    requestPlayerNation?: string;
  }>();

  const counterpartyId = typeof params.counterpartyId === 'string' ? params.counterpartyId : '';
  const requestInstanceId = typeof params.requestInstanceId === 'string' ? params.requestInstanceId : '';
  const counterpartyUsername =
    typeof params.counterpartyUsername === 'string' ? params.counterpartyUsername : t('trades.defaultPlayer');
  const requestSerialLabel =
    typeof params.requestSerialLabel === 'string' ? params.requestSerialLabel : '—';
  const requestPlayerName =
    typeof params.requestPlayerName === 'string'
      ? params.requestPlayerName
      : t('trades.selectedCardFallback');
  const requestPlayerImage =
    typeof params.requestPlayerImage === 'string' ? params.requestPlayerImage : '';
  const requestPlayerOvr =
    typeof params.requestPlayerOvr === 'string' && params.requestPlayerOvr.trim().length > 0
      ? Number(params.requestPlayerOvr)
      : null;
  const requestPlayerNation =
    typeof params.requestPlayerNation === 'string' ? params.requestPlayerNation : '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [starterIds, setStarterIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    async function load() {
      if (!counterpartyId || !requestInstanceId) {
        setError(t('trades.invalidProposalData'));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [instances, team] = await Promise.all([fetchAllUserInstances(), getUserTeam()]);
        if (!active) return;
        const mapped = instances.map(mapUserInstanceToCollectionItem);
        setItems(mapped);
        const starters = new Set(
          (team?.slots ?? []).map((slot) => slot.instance?.id).filter((id): id is string => !!id)
        );
        setStarterIds(starters);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : t('trades.loadCollectionError'));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [counterpartyId, requestInstanceId]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.card.player.toLowerCase().includes(q) ||
        (item.card.team ?? '').toLowerCase().includes(q) ||
        (item.card.nation ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggleSelect = (instanceId: string | undefined) => {
    if (!instanceId) return;
    if (starterIds.has(instanceId)) return;
    setSelected((prev) =>
      prev.includes(instanceId) ? prev.filter((id) => id !== instanceId) : prev.concat(instanceId)
    );
  };

  const submit = async () => {
    if (!counterpartyId || !requestInstanceId) return;
    if (selected.length === 0) {
      toast.showWarning(t('trades.selectAtLeastOneCard'));
      return;
    }
    setSaving(true);
    try {
      await createTrade({
        counterpartyId,
        offerInstanceIds: selected,
        requestInstanceIds: [requestInstanceId],
      });
      toast.showSuccess(t('trades.proposalSentSuccess'));
      router.back();
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : t('trades.sendProposalError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t('trades.createTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.targetCard}>
        <Text style={styles.sectionLabel}>{t('trades.youWant')}</Text>
        <View style={styles.targetRow}>
          <CardArtwork uri={requestPlayerImage} style={styles.targetImage} pointerEvents="none" />
          <View style={styles.targetMain}>
            <View style={styles.targetTopRow}>
              <Text style={styles.targetTitle} numberOfLines={1}>
                {requestPlayerName}
              </Text>
              {requestPlayerOvr != null ? (
                <View style={styles.targetOvrBadge}>
                  <Text style={styles.targetOvrText}>{requestPlayerOvr}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.targetSubtitle}>
              {t('trades.serialOwnerLine', { serial: requestSerialLabel, owner: counterpartyUsername })}
            </Text>
            <Text style={styles.targetNation}>
              {t('trades.nationLine', { nation: requestPlayerNation || '—' })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('trades.searchOwnCards')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.instance.instanceUuid ?? `${item.card.id}-${item.instance.id}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          renderItem={({ item }) => {
            const uuid = item.instance.instanceUuid;
            const isSelected = !!uuid && selected.includes(uuid);
            const isStarter = !!uuid && starterIds.has(uuid);
            return (
              <Pressable
                onPress={() => toggleSelect(uuid)}
                disabled={isStarter}
                style={[styles.row, isSelected && styles.rowSelected, isStarter && styles.rowDisabled]}
              >
                <CardArtwork uri={item.card.image} style={styles.rowImage} pointerEvents="none" />
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{item.card.player}</Text>
                  <Text style={styles.rowSubtitle}>
                    {t('trades.rowSerialOvr', {
                      serial: item.instance.id,
                      max: item.card.maxSupply,
                      ovr: item.card.rating,
                    })}
                  </Text>
                  <Text style={styles.rowNation}>
                    {t('trades.nationLine', { nation: item.card.nation ?? '—' })}
                  </Text>
                  {isStarter ? (
                    <Text style={styles.rowStarterText}>{t('trades.teamStarterLocked')}</Text>
                  ) : null}
                </View>
                <View style={[styles.check, isSelected && styles.checkSelected]}>
                  {isStarter ? (
                    <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
                  ) : isSelected ? (
                    <Ionicons name="checkmark" size={16} color={colors.text} />
                  ) : null}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('trades.noCardsForFilter')}</Text>
          }
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerLabel}>{t('trades.selectedCount', { count: selected.length })}</Text>
        <Pressable
          onPress={submit}
          disabled={saving || loading || selected.length === 0}
          style={({ pressed }) => [
            styles.submitBtn,
            (pressed || saving || selected.length === 0) && styles.submitBtnPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.submitText}>{t('trades.sendProposal')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  targetCard: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  targetImage: {
    width: 52,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.cardBorder,
  },
  targetMain: {
    flex: 1,
    minWidth: 0,
  },
  targetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  targetOvrBadge: {
    minWidth: 36,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  targetOvrText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  targetSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.primaryLight,
  },
  targetNation: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    backgroundColor: colors.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowMain: {
    flex: 1,
  },
  rowImage: {
    width: 42,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.cardBorder,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowNation: {
    marginTop: 2,
    fontSize: 11,
    color: colors.primaryLight,
  },
  rowStarterText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.destructive,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  footerLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnPressed: {
    opacity: 0.8,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
