/**
 * Dados normalizados para o modal `WinnerReveal` (mock ou `POST /battles/instant-open`).
 */

export type WinnerRevealSlot = {
  slotIndex: number;
  cardName: string;
  ovr: number;
  /** URL absoluta ou relativa (usar `resolveCardImageUri` na UI). */
  imageUrl: string | null;
  nation: string;
};

export type WinnerRevealTeamPayload = {
  teamName: string;
  userId?: string;
  shieldId?: number | null;
  shieldUrl?: string | null;
  slots: WinnerRevealSlot[];
  baseOverallSum: number;
  nationalityBonusPercent: number;
  nationalitySynergy: { nation: string; count: number; bonusPercent: number }[];
  overall: number;
};

export type WinnerRevealContent = {
  challenger: WinnerRevealTeamPayload;
  challenged: WinnerRevealTeamPayload;
  winnerSide: 'challenger' | 'challenged';
  viewerRole?: 'challenger' | 'challenged';
  /**
   * Carta surpresa do vencedor (`battle.rewardCardInstance` no instant-open).
   * Só é revelada na UI quando o viewer é o vencedor.
   */
  surpriseRewardCard?: WinnerRevealSlot | null;
};
