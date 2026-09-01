/**
 * Demo/placeholder data for the Cards (search) screen.
 * Cards list comes from SQLite; demo is used only for instances (and optional collection stats).
 */

import type { PlayerRow } from '@/types/player';
import { getFlagEmojiForCountry } from '@/assets/flags';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';

/** Total de cartas no jogo (fake). ~1,2M no total (1000 por jogador × ~1200 jogadores). Estável por sessão. */
let _cachedFakeTotal: number | null = null;

export function getFakeTotalCardsInGame(): number {
  if (_cachedFakeTotal == null) {
    const min = 1_100_000;
    const max = 1_300_000;
    _cachedFakeTotal = min + Math.floor(Math.random() * (max - min + 1));
  }
  return _cachedFakeTotal;
}

export type CardRarity = 'Legendary' | 'Rare' | 'Epic' | 'Common';

export interface CardStats {
  speed: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

/** A single physical instance of a card (e.g. 10/1000). id = which of the total (rarity). */
export interface CardInstance {
  id: number;
  /** UUID da instância no backend (GET /user/instances), para chaves e deep links. */
  instanceUuid?: string;
  owner?: string;
  /** Market value in XP */
  marketValueXp: number;
  /** When the card was found (e.g. "04 Feb 2026") */
  foundWhen: string;
  /** Where the card was found (e.g. "São Paulo, Brazil") */
  foundWhere: string;
  /** Number of trade proposals */
  proposalCount: number;
}

export interface CollectionCard {
  id: number;
  player: string;
  team: string;
  rating: number;
  rarity: CardRarity;
  image: string;
  /** Optional global rank (lower = better). */
  rank?: number | null;
  /** Optional nation name and emoji flag. */
  nation?: string | null;
  flagEmoji?: string | null;
  /** Number of instances of this card that have been found (collected). */
  foundCount: number;
  /** Total instances per player (usually 1000). */
  totalCount: number;
  maxSupply: number;
  /** Found instances: each has id (1..totalCount) and optional owner. Sorted by id (rarity). */
  instances: CardInstance[];
  position?: string;
  stats?: CardStats;
  marketValue?: string;
  discoveredAt?: string;
  discoveredDate?: string;
}

const FAKE_OWNERS = ['You', 'Player_A', 'Collector_1', 'Trader_X', 'Fan_99'];
const FAKE_LOCATIONS = [
  'São Paulo, Brazil',
  'Paris, France',
  'Buenos Aires, Argentina',
  'Manchester, England',
  'Madrid, Spain',
  'Barcelona, Spain',
  'Rio de Janeiro, Brazil',
  'London, England',
  'Milan, Italy',
];
const FAKE_DATES = [
  '04 Feb 2026',
  '12 Jan 2026',
  '28 Jan 2026',
  '15 Feb 2026',
  '01 Feb 2026',
  '08 Feb 2026',
  '20 Dec 2025',
  '03 Nov 2025',
  '14 Oct 2025',
];

/** User collection target: ~10–15 instances total. Each card gets 1–3 instances. */
const MAX_INSTANCES_PER_CARD = 3;

function fakeFoundCount(cardId: number, total: number): number {
  const seed = (cardId * 137 + 42) % 997;
  const raw = Math.floor((seed / 997) * (MAX_INSTANCES_PER_CARD + 1));
  const n = Math.min(MAX_INSTANCES_PER_CARD, Math.max(1, raw));
  return Math.min(total, n);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/** Generates fake instances for a card: unique ids 1..totalCount, with full instance data. Sorted by id. */
function generateInstances(cardId: number, totalCount: number): CardInstance[] {
  const n = fakeFoundCount(cardId, totalCount);
  const ids = new Set<number>();
  while (ids.size < n) {
    ids.add(1 + Math.floor(Math.random() * totalCount));
  }
  const sorted = Array.from(ids).sort((a, b) => a - b);
  return sorted.map((id, index) => {
    const seed = cardId * 1000 + id + index * 7;
    const xpBase = 800 + (id % 50) * 40 + (seed % 100);
    return {
      id,
      owner: pick(FAKE_OWNERS, seed),
      marketValueXp: Math.round(xpBase / 50) * 50,
      foundWhen: pick(FAKE_DATES, seed + 1),
      foundWhere: pick(FAKE_LOCATIONS, seed + 2),
      proposalCount: (seed + id) % 12,
    };
  });
}

/** One instance per card (for "Minha Coleção" seed). Optional owner override (e.g. "You"). */
function generateSingleInstance(
  cardId: number,
  totalCount: number,
  overrides?: { owner?: string }
): CardInstance[] {
  const id = (cardId % totalCount) + 1;
  const seed = cardId * 1000 + id;
  const xpBase = 800 + (id % 50) * 40 + (seed % 100);
  const instance: CardInstance = {
    id,
    owner: overrides?.owner ?? pick(FAKE_OWNERS, seed),
    marketValueXp: Math.round(xpBase / 50) * 50,
    foundWhen: pick(FAKE_DATES, seed + 1),
    foundWhere: pick(FAKE_LOCATIONS, seed + 2),
    proposalCount: (seed + id) % 12,
  };
  return [instance];
}

function buildCard(
  cardId: number,
  player: string,
  team: string,
  rating: number,
  rarity: CardRarity,
  image: string,
  rest: Partial<CollectionCard>
): CollectionCard {
  const totalCount = 1000;
  const instances = generateInstances(cardId, totalCount);
  return {
    id: cardId,
    player,
    team,
    rating,
    rarity,
    image,
    foundCount: instances.length, // always matches number of found instances
    totalCount,
    maxSupply: totalCount,
    instances,
    ...rest,
  };
}

export const DEMO_COLLECTION_CARDS: CollectionCard[] = [
  buildCard(1, 'Neymar Jr.', 'Brazil', 92, 'Legendary',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Forward', stats: { speed: 95, shooting: 89, passing: 91, dribbling: 96, defense: 62, physical: 78 }, marketValue: '2,500 XP', discoveredAt: 'São Paulo, Brazil', discoveredDate: '04 Fev 2026' },
  ),
  buildCard(2, 'Kylian Mbappé', 'France', 95, 'Legendary',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Forward', stats: { speed: 98, shooting: 92, passing: 88, dribbling: 95, defense: 65, physical: 82 }, marketValue: '3,200 XP', discoveredAt: 'Paris, France', discoveredDate: '12 Jan 2026' },
  ),
  buildCard(3, 'L. Messi', 'Argentina', 94, 'Legendary',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Forward', stats: { speed: 88, shooting: 93, passing: 94, dribbling: 97, defense: 58, physical: 72 }, marketValue: '2,800 XP', discoveredAt: 'Buenos Aires, Argentina', discoveredDate: '28 Jan 2026' },
  ),
  buildCard(4, 'K. De Bruyne', 'England', 91, 'Rare',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Midfielder', stats: { speed: 82, shooting: 86, passing: 95, dribbling: 88, defense: 72, physical: 78 }, marketValue: '1,900 XP', discoveredAt: 'Manchester, England', discoveredDate: '15 Fev 2026' },
  ),
  buildCard(5, 'Vinicius Jr.', 'Brazil', 89, 'Rare',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjBhY3Rpb24lMjBzcG9ydHN8ZW58MXx8fHwxNzcwMjQ4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Forward', stats: { speed: 96, shooting: 85, passing: 84, dribbling: 93, defense: 55, physical: 74 }, marketValue: '1,600 XP', discoveredAt: 'Madrid, Spain', discoveredDate: '01 Fev 2026' },
  ),
  buildCard(6, 'Pedri', 'Spain', 87, 'Rare',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW18ZW58MXx8fHwxNzcwMjMzNDExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    { position: 'Midfielder', stats: { speed: 84, shooting: 78, passing: 90, dribbling: 89, defense: 68, physical: 70 }, marketValue: '1,400 XP', discoveredAt: 'Barcelona, Spain', discoveredDate: '08 Fev 2026' },
  ),
  buildCard(7, 'Cristiano Ronaldo', 'Portugal', 91, 'Legendary',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Forward', stats: { speed: 88, shooting: 93, passing: 82, dribbling: 87, defense: 38, physical: 90 }, marketValue: '2,900 XP', discoveredAt: 'Lisbon, Portugal', discoveredDate: '02 Fev 2026' },
  ),

  buildCard(8, 'Kevin De Bruyne', 'Belgium', 91, 'Legendary',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Midfielder', stats: { speed: 80, shooting: 86, passing: 95, dribbling: 88, defense: 70, physical: 78 }, marketValue: '2,700 XP', discoveredAt: 'Brussels, Belgium', discoveredDate: '03 Fev 2026' },
  ),

  buildCard(9, 'Robert Lewandowski', 'Poland', 90, 'Epic',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Forward', stats: { speed: 78, shooting: 94, passing: 78, dribbling: 85, defense: 44, physical: 86 }, marketValue: '2,300 XP', discoveredAt: 'Warsaw, Poland', discoveredDate: '05 Fev 2026' },
  ),

  buildCard(10, 'Luka Modric', 'Croatia', 89, 'Epic',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Midfielder', stats: { speed: 76, shooting: 82, passing: 92, dribbling: 90, defense: 72, physical: 68 }, marketValue: '2,100 XP', discoveredAt: 'Zagreb, Croatia', discoveredDate: '06 Fev 2026' },
  ),

  buildCard(11, 'Virgil van Dijk', 'Netherlands', 89, 'Epic',
    'https://images.unsplash.com/photo-1761225091881-0d3bda9f6d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Defender', stats: { speed: 78, shooting: 60, passing: 80, dribbling: 72, defense: 92, physical: 94 }, marketValue: '2,200 XP', discoveredAt: 'Amsterdam, Netherlands', discoveredDate: '07 Fev 2026' },
  ),

  buildCard(12, 'Alisson Becker', 'Brazil', 90, 'Epic',
    'https://images.unsplash.com/photo-1649693710813-e4eedb415669?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    { position: 'Goalkeeper', stats: { speed: 60, shooting: 30, passing: 85, dribbling: 65, defense: 92, physical: 88 }, marketValue: '2,300 XP', discoveredAt: 'Rio de Janeiro, Brazil', discoveredDate: '08 Fev 2026' },
  ),

];

/** Returns demo card (with instances) for a given id, if present. Used only for instances. */
export function getDemoCardById(id: number): CollectionCard | undefined {
  return DEMO_COLLECTION_CARDS.find((c) => c.id === id);
}

/** Collection stats from demo (sum of foundCount). Use for "Minha Coleção" until real data exists. */
export function getDemoCollectionStats(): { collected: number } {
  const collected = DEMO_COLLECTION_CARDS.reduce((s, c) => s + c.foundCount, 0);
  return { collected };
}

/** Deriva raridade a partir do overall (ovr). */
function rarityFromOvr(ovr: number): CardRarity {
  if (ovr >= 90) return 'Legendary';
  if (ovr >= 87) return 'Epic';
  if (ovr >= 84) return 'Rare';
  return 'Common';
}

/**
 * Converte um PlayerRow em CollectionCard com uma instância (para "Minha Coleção").
 * Usado quando o seed vem do banco: só jogadores que existem na base, uma carta por atleta.
 * options.owner força o owner da instância (ex.: "You" para as ~20 do usuário).
 */
export function playerRowToCollectionCardWithInstances(
  row: PlayerRow,
  options?: { owner?: string }
): CollectionCard {
  const totalCount = 1000;
  const instances = generateSingleInstance(row.id, totalCount, { owner: options?.owner });
  const nation = row.nation ?? null;
  const flagEmoji = nation ? getFlagEmojiForCountry(nation) ?? undefined : undefined;
  const stats: CardStats = {
    speed: row.pac ?? 0,
    shooting: row.sho ?? 0,
    passing: row.pas ?? 0,
    dribbling: row.dri ?? 0,
    defense: row.def ?? 0,
    physical: row.phy ?? 0,
  };
  return {
    id: row.id,
    player: row.name,
    team: (row.team ?? row.nation) ?? '',
    rating: row.ovr ?? 0,
    rarity: rarityFromOvr(row.ovr ?? 0),
    image: row.url ?? PLACEHOLDER_IMAGE,
    rank: row.rank ?? null,
    nation,
    flagEmoji,
    foundCount: instances.length,
    totalCount,
    maxSupply: totalCount,  
    instances,
    position: row.position ?? undefined,
    stats,
  };
}

/**
 * Maps a PlayerRow (SQLite) to CollectionCard. Uses demo only for instances/foundCount/totalCount
 * when the player id exists in the demo set; otherwise defaults (0/1, []).
 */
export function playerRowToCollectionCard(row: PlayerRow): CollectionCard {
  const demo = getDemoCardById(row.id);
  const stats: CardStats = demo?.stats ?? {
    speed: row.pac ?? 0,
    shooting: row.sho ?? 0,
    passing: row.pas ?? 0,
    dribbling: row.dri ?? 0,
    defense: row.def ?? 0,
    physical: row.phy ?? 0,         
  };
  const nation = row.nation ?? null;
  const flagEmoji = nation ? getFlagEmojiForCountry(nation) ?? undefined : undefined;
  const foundCount = row.foundCount ?? demo?.foundCount ?? 0;
  const maxSupply = row.maxSupply ?? demo?.maxSupply ?? 1000;
  const totalCount = maxSupply;
  return {
    id: row.id,
    player: row.name,
    team: (row.team ?? row.nation) ?? '',
    rating: row.ovr ?? 0,
    rarity: demo?.rarity ?? 'Common',
    image: row.url ?? demo?.image ?? PLACEHOLDER_IMAGE,
    rank: row.rank ?? null,
    nation,
    flagEmoji,
    foundCount,
    totalCount,
    maxSupply,
    instances: demo?.instances ?? [],
    position: row.position ?? demo?.position,
    stats,
    marketValue: demo?.marketValue,
    discoveredAt: demo?.discoveredAt,
    discoveredDate: demo?.discoveredDate,
  };
}
