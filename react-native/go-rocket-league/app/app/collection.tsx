import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionFiltersModal } from '@/components/CollectionFiltersModal';
import { MyCollectionCard } from '@/components/MyCollectionCard';
import { getUserInstances } from '@/lib/api/userInstancesApi';
import {
  buildCollectionListParams,
  DEFAULT_COLLECTION_FILTERS,
  isCollectionFiltersActive,
  type CollectionListFilters,
} from '@/lib/collection/collectionListQuery';
import type { CollectionItem } from '@/lib/collection/mapUserInstance';
import { mapUserInstanceToCollectionItem } from '@/lib/collection/mapUserInstance';
import { colors } from '@/theme';
import { t } from '@/i18n';
import { useUserStore } from '@/store/userStore';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

const SEARCH_ICON_SIZE = 20;
const INPUT_PADDING_LEFT = 12 + SEARCH_ICON_SIZE + 12;

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accessToken = useUserStore((s) => s.accessToken);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<CollectionListFilters>(DEFAULT_COLLECTION_FILTERS);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [allItems, setAllItems] = useState<CollectionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersActive = useMemo(() => isCollectionFiltersActive(appliedFilters), [appliedFilters]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    if (!accessToken) {
      setAllItems([]);
      setTotal(0);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setAllItems([]);
      setTotal(0);
      setError(null);
      try {
        const res = await getUserInstances(
          buildCollectionListParams(0, debouncedSearch, appliedFilters, PAGE_SIZE)
        );
        if (cancelled) return;
        setAllItems(res.instances.map(mapUserInstanceToCollectionItem));
        setTotal(res.total);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, debouncedSearch, appliedFilters]);

  const onRefresh = useCallback(async () => {
    if (!accessToken) return;
    setRefreshing(true);
    setError(null);
    try {
      const res = await getUserInstances(
        buildCollectionListParams(0, debouncedSearch, appliedFilters, PAGE_SIZE)
      );
      setAllItems(res.instances.map(mapUserInstanceToCollectionItem));
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, debouncedSearch, appliedFilters]);

  const onEndReached = useCallback(async () => {
    if (!accessToken || loadingMore || loading) return;
    if (allItems.length >= total) return;

    setLoadingMore(true);
    setError(null);
    try {
      const res = await getUserInstances(
        buildCollectionListParams(allItems.length, debouncedSearch, appliedFilters, PAGE_SIZE)
      );
      setAllItems((prev) => [...prev, ...res.instances.map(mapUserInstanceToCollectionItem)]);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }, [accessToken, loadingMore, loading, allItems.length, total, debouncedSearch, appliedFilters]);

  const stats = useMemo(() => {
    return { collected: total };
  }, [total]);

  const listEmptyMessage = useMemo(() => {
    if (!accessToken) return t('collection.sessionRequired');
    if (debouncedSearch || filtersActive) return t('collection.emptySearch');
    return t('collection.emptyList');
  }, [accessToken, debouncedSearch, filtersActive]);

  const showEmptyPlaceholder = !error || allItems.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('collection.listTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('collection.entrySubtitle', {
              countFormatted: stats.collected.toLocaleString(),
            })}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={3}>
            {error}
          </Text>
          <Pressable
            onPress={onRefresh}
            style={({ pressed }) => [styles.retryBtn, pressed && styles.retryBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('collection.retry')}>
            <Text style={styles.retryBtnText}>{t('collection.retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons
            name="search"
            size={SEARCH_ICON_SIZE}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('collection.searchPlaceholder')}
            placeholderTextColor={colors.textDisabled}
            style={styles.searchInput}
            selectionColor={colors.primaryLight}
            editable={!!accessToken && !loading}
          />
        </View>
        <Pressable
          onPress={() => setFiltersModalOpen(true)}
          style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={t('collection.filtersOpenHint')}>
          <Ionicons name="options-outline" size={22} color={colors.text} />
          {filtersActive ? <View style={styles.filterBadgeDot} /> : null}
        </Pressable>
      </View>

      {loading && allItems.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item) =>
            item.instance.instanceUuid ?? `${item.card.id}-${item.instance.id}`
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            accessToken ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primaryLight}
              />
            ) : undefined
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.primaryLight} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            showEmptyPlaceholder ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>{listEmptyMessage}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <MyCollectionCard
              card={item.card}
              instance={item.instance}
              onProposePress={(card) => {
                router.push(`/card-details/${card.id}`);
              }}
              onViewProposalsPress={(card) => {
                router.push(`/card-details/${card.id}/instances`);
              }}
            />
          )}
        />
      )}

      <CollectionFiltersModal
        visible={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        initialFilters={appliedFilters}
        onApply={setAppliedFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.text,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryBtnPressed: {
    opacity: 0.9,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  searchInputWrap: {
    flex: 1,
    position: 'relative',
    minWidth: 0,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    height: 48,
    paddingLeft: INPUT_PADDING_LEFT,
    paddingRight: 16,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    fontSize: 16,
    color: colors.text,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnPressed: {
    opacity: 0.88,
  },
  filterBadgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  footerLoading: {
    paddingVertical: 16,
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
