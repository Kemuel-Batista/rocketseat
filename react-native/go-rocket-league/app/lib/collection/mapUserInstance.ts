import { getFlagEmojiForCountry } from '@/assets/flags';
import type { CardInstance, CardRarity, CollectionCard } from '@/demo';
import type { UserInstanceDto } from '@/lib/api/userInstancesApi';

export type CollectionItem = { card: CollectionCard; instance: CardInstance };

function serialClassToRarity(serialClass: string): CardRarity {
  switch (serialClass) {
    case 'extreme':
      return 'Legendary';
    case 'elite':
      return 'Rare';
    case 'standard':
    default:
      return 'Common';
  }
}

function formatFoundWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatFoundWhere(w: UserInstanceDto['foundWhere']): string {
  if (!w) return '—';
  const parts = [w.city, w.state].filter((x): x is string => !!x && String(x).trim().length > 0);
  if (parts.length > 0) return parts.join(', ');
  if (typeof w.lat === 'number' && typeof w.lng === 'number') {
    return `${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}`;
  }
  return '—';
}

/**
 * Converte um item de GET /user/instances para o par usado em Minha Coleção.
 */
export function mapUserInstanceToCollectionItem(row: UserInstanceDto): CollectionItem {
  const c = row.card;
  const serial = row.serialNumber;
  const max = c.maxSupply;
  const nationRaw = c.nation ?? null;
  const nation = nationRaw?.trim() ? nationRaw.trim() : null;
  const flagEmoji = nation ? getFlagEmojiForCountry(nation) : undefined;

  const instance: CardInstance = {
    id: serial,
    instanceUuid: row.id,
    owner: 'You',
    marketValueXp: Math.max(0, Math.round((c.ovr ?? 70) * 12)),
    foundWhen: formatFoundWhen(row.foundWhen ?? row.spawnedAt),
    foundWhere: formatFoundWhere(row.foundWhere),
    proposalCount: 0,
  };

  const teamRaw = c.team ?? null;
  const team = teamRaw?.trim() ? teamRaw.trim() : '';

  const card: CollectionCard = {
    id: c.id,
    player: c.name,
    team,
    rating: c.ovr,
    rarity: serialClassToRarity(row.serialClass),
    image: c.url,
    nation,
    flagEmoji: flagEmoji ?? null,
    foundCount: 1,
    totalCount: max,
    maxSupply: max,
    instances: [instance],
  };

  return { card, instance };
}
