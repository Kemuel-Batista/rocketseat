import type { WinnerRevealContent } from './battleRevealTypes';

/** URLs de exemplo — em produção vêm de `instance.card.url`. */
const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/240/320`;

/**
 * Dois times simulados para testar `WinnerReveal` sem chamar a API.
 * Bônus alinhados à tabela USER_TEAM (2→+5%, 3→+10%, 4→+30%, 5→+80% por grupo).
 */
export const MOCK_WINNER_REVEAL: WinnerRevealContent = {
  challenger: {
    teamName: 'Dragões FC',
    userId: 'mock-challenger',
    shieldId: 2,
    shieldUrl: null,
    slots: [
      { slotIndex: 0, cardName: 'Neymar Silva', ovr: 92, imageUrl: IMG('c0'), nation: 'Portugal' },
      { slotIndex: 1, cardName: 'Cristina Santos Junior', ovr: 90, imageUrl: IMG('c1'), nation: 'Portugal' },
      { slotIndex: 2, cardName: 'Rafael Costa', ovr: 90, imageUrl: IMG('c2'), nation: 'Portugal' },
      { slotIndex: 3, cardName: 'Kylian Mbappé', ovr: 88, imageUrl: IMG('c3'), nation: 'France' },
      { slotIndex: 4, cardName: 'Antoine Griezmann', ovr: 88, imageUrl: IMG('c4'), nation: 'France' },
    ],
    baseOverallSum: 448,
    nationalityBonusPercent: 15,
    nationalitySynergy: [
      { nation: 'POR', count: 3, bonusPercent: 10 },
      { nation: 'FRA', count: 2, bonusPercent: 5 },
    ],
    overall: Math.round(448 * 1.15),
  },
  challenged: {
    teamName: 'Sky United',
    userId: 'mock-challenged',
    shieldId: 4,
    shieldUrl: null,
    slots: [
      { slotIndex: 0, cardName: 'Vinícius Junior', ovr: 90, imageUrl: IMG('d0'), nation: 'Brazil' },
      { slotIndex: 1, cardName: 'Casemiro Silva', ovr: 88, imageUrl: IMG('d1'), nation: 'Brazil' },
      { slotIndex: 2, cardName: 'Pedri González', ovr: 89, imageUrl: IMG('d2'), nation: 'Spain' },
      { slotIndex: 3, cardName: 'Toni Kroos', ovr: 87, imageUrl: IMG('d3'), nation: 'Germany' },
      { slotIndex: 4, cardName: 'Manuel Neuer', ovr: 86, imageUrl: IMG('d4'), nation: 'Germany' },
    ],
    baseOverallSum: 440,
    nationalityBonusPercent: 10,
    nationalitySynergy: [
      { nation: 'BRA', count: 2, bonusPercent: 5 },
      { nation: 'GER', count: 2, bonusPercent: 5 },
    ],
    overall: Math.round(440 * 1.1),
  },
  winnerSide: 'challenger',
  viewerRole: 'challenger',
  surpriseRewardCard: {
    slotIndex: -1,
    cardName: 'Lionel Messi',
    ovr: 94,
    imageUrl: IMG('surprise-win'),
    nation: 'Argentina',
  },
};

/** Mesmo duelo com times invertidos e viewer como perdedor (coluna esquerda = teu lado). */
export const MOCK_WINNER_REVEAL_LOSER: WinnerRevealContent = {
  challenger: MOCK_WINNER_REVEAL.challenged,
  challenged: MOCK_WINNER_REVEAL.challenger,
  winnerSide: 'challenged',
  viewerRole: 'challenger',
  surpriseRewardCard: null,
};
