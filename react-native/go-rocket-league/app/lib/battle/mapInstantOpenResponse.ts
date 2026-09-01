import type {
  BattleDto,
  InstantOpenBattleResponseDto,
  InstantOpenBattleTeamDto,
} from '@/lib/api/battlesApi';
import type { WinnerRevealContent, WinnerRevealSlot, WinnerRevealTeamPayload } from './battleRevealTypes';

function mapSlot(s: InstantOpenBattleTeamDto['slots'][number]): WinnerRevealSlot | null {
  const card = s.instance?.card;
  if (!card) return null;
  return {
    slotIndex: s.slotIndex,
    cardName: String(card.name ?? 'Player'),
    ovr: Math.floor(Number(card.ovr) || 0),
    imageUrl: card.url != null ? String(card.url) : null,
    nation: String(card.nation ?? '').trim() || '—',
  };
}

/** `battle.rewardCardInstance` — mesmo formato enriquecido que slots (`instance.card` ou `card`). */
function mapRewardCardInstance(raw: unknown): WinnerRevealSlot | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const nested = o.instance;
  const card =
    (o.card as Record<string, unknown> | undefined) ??
    (nested != null && typeof nested === 'object'
      ? ((nested as Record<string, unknown>).card as Record<string, unknown> | undefined)
      : undefined);
  if (!card || typeof card !== 'object') return null;
  return {
    slotIndex: -1,
    cardName: String(card.name ?? 'Player'),
    ovr: Math.floor(Number(card.ovr) || 0),
    imageUrl: card.url != null ? String(card.url) : null,
    nation: String(card.nation ?? '').trim() || '—',
  };
}

function mapTeam(t: InstantOpenBattleTeamDto): WinnerRevealTeamPayload {
  const slots = [...t.slots]
    .map(mapSlot)
    .filter((x): x is WinnerRevealSlot => x != null)
    .sort((a, b) => a.slotIndex - b.slotIndex);
  return {
    teamName: String(t.teamName ?? 'Team'),
    userId: t.userId,
    shieldId: t.shieldId ?? null,
    shieldUrl: t.shieldUrl ?? null,
    slots,
    baseOverallSum: Math.floor(Number(t.baseOverallSum) || 0),
    nationalityBonusPercent: Math.floor(Number(t.nationalityBonusPercent) || 0),
    nationalitySynergy: Array.isArray(t.nationalitySynergy) ? t.nationalitySynergy : [],
    overall: Math.floor(Number(t.overall) || 0),
  };
}

/** Converte a resposta do instant-open em conteúdo para `WinnerReveal`. */
export function mapInstantOpenToRevealContent(
  res: InstantOpenBattleResponseDto
): WinnerRevealContent | null {
  const teams = res.teams;
  if (!teams?.challenger || !teams?.challenged) return null;
  const challenger = mapTeam(teams.challenger);
  const challenged = mapTeam(teams.challenged);
  const w = res.summary?.winnerUserId;
  const cid = teams.challenger.userId;
  const did = teams.challenged.userId;
  let winnerSide: 'challenger' | 'challenged' = 'challenged';
  if (w && cid != null && String(w) === String(cid)) winnerSide = 'challenger';
  else if (w && did != null && String(w) === String(did)) winnerSide = 'challenged';
  const battle = res.battle as BattleDto | undefined;
  const surpriseRewardCard = mapRewardCardInstance(battle?.rewardCardInstance ?? null);
  return {
    challenger,
    challenged,
    winnerSide,
    viewerRole: res.viewerRole,
    surpriseRewardCard,
  };
}
