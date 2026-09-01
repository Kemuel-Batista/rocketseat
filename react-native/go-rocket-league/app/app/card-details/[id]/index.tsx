import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

import { CardDetailsScreen } from '@/components/CardDetailsScreen';
import { playerRowToCollectionCard } from '@/demo';
import type { CollectionCard } from '@/demo';
import { colors } from '@/theme';
import { subscribePlayersProgress } from '@/lib/playersProgressChannel';
import { getPlayerById, getTopPlayersByRank, initPlayersDb } from '@/lib/db/playersDb';

const SIMILAR_COUNT = 4;
const SIMILAR_POOL = 20;

function getCardFromDb(cardId: number): CollectionCard | null {
  initPlayersDb();
  const player = getPlayerById(cardId);
  return player ? playerRowToCollectionCard(player) : null;
}

export default function CardDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cardId = id ? parseInt(id, 10) : NaN;
  const [card, setCard] = useState<CollectionCard | null>(() =>
    Number.isNaN(cardId) ? null : getCardFromDb(cardId)
  );

  useEffect(() => {
    if (Number.isNaN(cardId)) {
      setCard(null);
      return;
    }
    setCard(getCardFromDb(cardId));
  }, [cardId]);

  useEffect(() => {
    const unsubscribe = subscribePlayersProgress((updates) => {
      const u = updates.find((x) => x.id === cardId);
      if (!u) return;
      setCard((prev) =>
        prev ? { ...prev, foundCount: u.foundCount, totalCount: u.maxSupply ?? prev.totalCount } : prev
      );
    });
    return unsubscribe;
  }, [cardId]);

  const similarCards = useMemo(() => {
    if (!card) return [];
    const pool = getTopPlayersByRank(SIMILAR_POOL);
    return pool
      .filter((p) => p.id !== card.id)
      .slice(0, SIMILAR_COUNT)
      .map(playerRowToCollectionCard);
  }, [card?.id]);

  if (!card) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Card not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CardDetailsScreen
      card={card}
      similarCards={similarCards}
      onBack={() => router.back()}
      onFoundPress={() => router.push(`/card-details/${card.id}/instances`)}
      onSimilarCardPress={(c) => router.replace(`/card-details/${c.id}`)}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
