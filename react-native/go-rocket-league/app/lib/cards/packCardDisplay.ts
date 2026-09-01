import { playerRowToCollectionCard } from '@/demo';
import type { PackGrantedCard } from '@/lib/colyseus/types';
import { getPlayerById, initPlayersDb } from '@/lib/db/playersDb';

export type PackCardDisplayInfo = {
  playerName: string;
  team: string;
  imageUri: string | null;
  rating: number;
};

/**
 * Resolve nome/arte da carta localmente pelo `cardId`; mescla `name`/`url` do servidor quando existirem.
 */
export function getPackCardDisplayInfo(card: PackGrantedCard): PackCardDisplayInfo {
  initPlayersDb();
  const row = getPlayerById(card.cardId);
  if (row) {
    const c = playerRowToCollectionCard(row);
    return {
      playerName: card.name ?? c.player,
      team: c.team,
      imageUri: card.url ?? c.image,
      rating: c.rating,
    };
  }

  return {
    playerName: card.name ?? `#${card.cardId}`,
    team: '',
    imageUri: card.url ?? null,
    rating: 0,
  };
}
