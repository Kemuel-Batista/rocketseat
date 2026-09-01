import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionCard } from '@/components/CollectionCard';
import type { CollectionCard as CollectionCardType } from '@/demo';
import { colors } from '@/theme';
import { t } from '@/i18n';
import type { ViewMode } from '@/components/CollectionViewModeToggle';

const GRID_GAP = 12;
const LIST_GAP = 16;

export interface CollectionCardListProps {
  cards: CollectionCardType[];
  viewMode: ViewMode;
  focusKey?: number;
  onCardPress?: (card: CollectionCardType) => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
}

function EmptyComponent() {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>{t('cards.emptyTitle')}</Text>
      <Text style={styles.emptySubtitle}>{t('cards.emptySubtitle')}</Text>
    </View>
  );
}

export function CollectionCardList({
  cards,
  viewMode,
  onCardPress,
  onEndReached,
  loadingMore = false,
}: CollectionCardListProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + 24;

  const renderItem: ListRenderItem<CollectionCardType> = useCallback(
    ({ item }) => {
      const variant = viewMode === 'bySelection' ? 'list' : viewMode;
      return (
        <View style={[viewMode === 'grid' ? styles.gridItem : undefined]}>
          <CollectionCard
            card={item}
            variant={variant}
            onPress={onCardPress ? () => onCardPress(item) : undefined}
          />
        </View>
      );
    },
    [viewMode, onCardPress]
  );

  const keyExtractor = useCallback((item: CollectionCardType) => String(item.id), []);

  const isGrid = viewMode === 'grid';
  const contentContainerStyle = useMemo(() => {
    if (cards.length === 0) return styles.emptyListContent;
    const base = isGrid ? styles.gridListContent : styles.listListContent;
    return [base, { paddingBottom: bottomPadding }];
  }, [cards.length, isGrid, bottomPadding]);

  return (
    <FlatList
      data={cards}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      key={isGrid ? 'grid' : 'list'}
      numColumns={isGrid ? 2 : 1}
      columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
      contentContainerStyle={contentContainerStyle}
      ListEmptyComponent={EmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <Text style={styles.footerLoaderText}>{t('cards.loadingMore')}</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    marginHorizontal: -GRID_GAP / 2,
    marginTop: GRID_GAP,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: GRID_GAP / 2,
  },
  gridListContent: {
    paddingBottom: GRID_GAP,
  },
  listListContent: {
    marginTop: LIST_GAP,
    gap: LIST_GAP,
    paddingBottom: LIST_GAP,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerLoaderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
