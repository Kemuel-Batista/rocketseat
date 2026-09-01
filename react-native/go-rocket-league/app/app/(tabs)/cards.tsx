import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CollectionCardList } from '@/components/CollectionCardList';
import { CollectionHeader } from '@/components/CollectionHeader';
import { SelectionList } from '@/components/SelectionList';
import { colors } from '@/theme';
import type { ViewMode } from '@/components/CollectionViewModeToggle';
import type { CollectionCard as CollectionCardType } from '@/demo';
import { subscribePlayersProgress } from '@/lib/playersProgressChannel';
import {
  initPlayersDb,
  getPlayersSearch,
  getUniqueNations,
} from '@/lib/db/playersDb';
import { getUserInstances } from '@/lib/api/userInstancesApi';
import { useUserStore } from '@/store/userStore';
import type { PlayerRow } from '@/types/player';
import { getFlagEmojiForCountry } from '@/assets/flags';

const PAGE_SIZE = 20;
const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';

function rarityFromOvr(ovr: number): CollectionCardType['rarity'] {
  if (ovr >= 90) return 'Legendary';
  if (ovr >= 87) return 'Epic';
  if (ovr >= 84) return 'Rare';
  return 'Common';
}

function mapPlayerRowToCard(row: PlayerRow): CollectionCardType {
  const rating = row.ovr ?? 0;
  const maxSupply = row.maxSupply ?? 1000;
  const foundCount = row.foundCount ?? 0;
  const nation = row.nation ?? null;
  const flagEmoji = nation ? getFlagEmojiForCountry(nation) ?? null : null;
  return {
    id: row.id,
    player: row.name,
    team: (row.team ?? nation) ?? '',
    rating,
    rarity: rarityFromOvr(rating),
    image: row.url ?? PLACEHOLDER_IMAGE,
    rank: row.rank ?? null,
    nation,
    flagEmoji,
    foundCount,
    totalCount: maxSupply,
    maxSupply,
    instances: [],
    position: row.position ?? undefined,
    stats: {
      speed: row.pac ?? 0,
      shooting: row.sho ?? 0,
      passing: row.pas ?? 0,
      dribbling: row.dri ?? 0,
      defense: row.def ?? 0,
      physical: row.phy ?? 0,
    },
  };
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accessToken = useUserStore((s) => s.accessToken);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [focusKey, setFocusKey] = useState(0);
  const [cards, setCards] = useState<CollectionCardType[]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [apiCollectionTotal, setApiCollectionTotal] = useState<number | null>(null);
  const prevViewModeRef = useRef<ViewMode>(viewMode);

  useEffect(() => {
    const prev = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;
    if (prev !== viewMode && (viewMode === 'bySelection' || prev === 'bySelection')) {
      setSearchQuery('');
    }
  }, [viewMode]);

  useEffect(() => {
    initPlayersDb();
    setSelections(getUniqueNations());
  }, []);

  const query = searchQuery.trim();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCards([]);
    setHasMore(true);
    initPlayersDb();
    const players = getPlayersSearch(query, PAGE_SIZE, 0);
    const mapped = players.map(mapPlayerRowToCard);
    if (!cancelled) {
      setCards(mapped);
      setHasMore(mapped.length >= PAGE_SIZE);
    }
    setLoading(false);
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const offset = cards.length;
    const players = getPlayersSearch(query, PAGE_SIZE, offset);
    const mapped = players.map(mapPlayerRowToCard);
    setCards((prev) => prev.concat(mapped));
    setHasMore(mapped.length >= PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loading, cards.length, query]);

  useEffect(() => {
    if (!accessToken) {
      setApiCollectionTotal(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getUserInstances({ limit: 1, offset: 0 });
        if (!cancelled) setApiCollectionTotal(res.total);
      } catch {
        if (!cancelled) setApiCollectionTotal(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((k) => k + 1);
      if (!accessToken) return undefined;
      let cancelled = false;
      (async () => {
        try {
          const res = await getUserInstances({ limit: 1, offset: 0 });
          if (!cancelled) setApiCollectionTotal(res.total);
        } catch {
          // mantém o último total exibido
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [accessToken])
  );

  // Atualiza found/total em tempo real quando o sync de progresso emite eventos
  useEffect(() => {
    const unsubscribe = subscribePlayersProgress((updates) => {
      setCards((prev) =>
        prev.map((c) => {
          const u = updates.find((x) => x.id === c.id);
          return u
            ? { ...c, foundCount: u.foundCount, totalCount: u.maxSupply ?? c.totalCount }
            : c;
        })
      );
    });
    return unsubscribe;
  }, []);

  const collectionStats = useMemo(
    () => ({
      collected: accessToken ? (apiCollectionTotal ?? 0) : 0,
    }),
    [accessToken, apiCollectionTotal]
  );

  const filteredSelections = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return selections;
    return selections.filter((name) => name.toLowerCase().includes(q));
  }, [selections, query]);

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 16, paddingHorizontal: 16 }]}>
        <CollectionHeader
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          collectionStats={collectionStats}
          onCollectionPress={() => router.push('/collection')}
        />
      </View>

      {loading ? (
        <View style={[styles.centered, { paddingBottom: insets.bottom + 24 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando cartas...</Text>
        </View>
      ) : viewMode === 'bySelection' ? (
        <ScrollView
          style={styles.selectionScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <SelectionList
            selections={filteredSelections}
            focusKey={focusKey}
            onSelectionPress={(name) => {
              router.push(`/selection/${encodeURIComponent(name)}`);
            }}
          />
        </ScrollView>
      ) : (
        <View style={styles.listWrap}>
          <CollectionCardList
            cards={cards}
            viewMode={viewMode}
            focusKey={focusKey}
            onCardPress={(card: CollectionCardType) => {
              router.push(`/card-details/${card.id}`);
            }}
            onEndReached={loadMore}
            loadingMore={loadingMore}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  selectionScroll: {
    flex: 1,
  },
  listWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
});
