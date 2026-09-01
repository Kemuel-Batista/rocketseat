import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollectionCardList } from '@/components/CollectionCardList';
import { playerRowToCollectionCard } from '@/demo';
import type { CollectionCard as CollectionCardType } from '@/demo';
import { colors } from '@/theme';
import { getPlayersByNation, initPlayersDb } from '@/lib/db/playersDb';

/**
 * Screen that shows cards filtered by nation (seleção) from SQLite.
 */
export default function SelectionScreen() {
  const { team } = useLocalSearchParams<{ team: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const nationName = team ? decodeURIComponent(team) : '';

  const cards = useMemo(() => {
    if (!nationName) return [];
    initPlayersDb();
    const players = getPlayersByNation(nationName);
    return players.map(playerRowToCollectionCard);
  }, [nationName]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>
            {nationName || 'Seleção'}
          </Text>
          <Text style={styles.subtitle}>
            {cards.length} {cards.length === 1 ? 'carta' : 'cartas'}
          </Text>
        </View>
      </View>

      <View style={[styles.listWrap, { paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }]}>
        <CollectionCardList
          cards={cards}
          viewMode="list"
          onCardPress={(card: CollectionCardType) => {
            router.push(`/card-details/${card.id}`);
          }}
        />
      </View>
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
  listWrap: {
    flex: 1,
    paddingTop: 16,
  },
});
