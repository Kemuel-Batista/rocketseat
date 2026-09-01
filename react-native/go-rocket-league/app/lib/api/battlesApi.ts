import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type BattleStakeTier = 'COINS_10' | 'COINS_50' | 'COINS_100' | 'COINS_1000';

export type BattleTierDto = {
  tier: BattleStakeTier;
  coins: number;
};

export type BattleTiersResponseDto = {
  tiers: BattleTierDto[];
};

export type BattleUserBriefDto = {
  id: string;
  username: string;
  avatarId: number;
};

export type BattleSnapshotDto = {
  teamId: string;
  teamName: string;
  overall: number;
  baseOverallSum: number;
  nationalityBonusPercent: number;
  maxSameNationCount: number;
  nationalitySynergy: { nation: string; count: number; bonusPercent: number }[];
  slots: unknown[];
};

export type BattleStatus = 'PENDING' | 'RESOLVED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

export type BattleDto = {
  id: string;
  status: BattleStatus;
  stakeTier: BattleStakeTier;
  stakeCoins: number;
  challenger: BattleUserBriefDto;
  challenged: BattleUserBriefDto;
  winner: BattleUserBriefDto | null;
  loser: BattleUserBriefDto | null;
  challengerSnapshot: BattleSnapshotDto;
  challengedSnapshot: BattleSnapshotDto;
  rewardCardInstance: unknown | null;
  expiresAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BattleListQuery = {
  role?: 'challenger' | 'challenged' | 'all';
  status?: BattleStatus;
  take?: number;
  skip?: number;
};

export type BattleListResponseDto = {
  items: BattleDto[];
  total: number;
  take: number;
  skip: number;
};

export type CreateBattleBody = {
  challengedId: string;
  stakeTier: BattleStakeTier;
};

/** POST `/battles/instant-open` — duelo imediato (USER_BATTLES_API.md). */
export type InstantOpenBattleBody = {
  opponentUserId: string;
  /** Opcional; se enviado, deve coincidir com o `openBattleStakeTier` do adversário. */
  stakeTier?: BattleStakeTier;
};

/** Time completo em `POST /battles/instant-open` (USER_BATTLES_API.md). */
export type InstantOpenBattleTeamSlotDto = {
  slotIndex: number;
  instance: {
    id?: string;
    cardId?: number;
    card?: {
      id?: number;
      name?: string;
      ovr?: number;
      url?: string | null;
      nation?: string | null;
    };
  };
};

export type InstantOpenBattleTeamDto = {
  userId?: string;
  teamId?: string;
  teamName: string;
  overall: number;
  baseOverallSum: number;
  nationalityBonusPercent: number;
  maxSameNationCount?: number;
  nationalitySynergy: { nation: string; count: number; bonusPercent: number }[];
  shieldId?: number | null;
  shieldUrl?: string | null;
  wins?: number;
  losses?: number;
  slots: InstantOpenBattleTeamSlotDto[];
};

export type InstantOpenBattleResponseDto = {
  battle: BattleDto | Record<string, unknown>;
  teams?: {
    challenger: InstantOpenBattleTeamDto;
    challenged: InstantOpenBattleTeamDto;
  };
  viewerRole?: 'challenger' | 'challenged';
  self: {
    result: 'win' | 'lose';
    xpGained: number;
    walletBalanceAfter: number;
  };
  summary: {
    pot: number;
    stakeCoins: number;
    stakeTier: BattleStakeTier;
    winnerUserId: string;
    loserUserId: string;
  };
};

function buildQueryString(q?: BattleListQuery): string {
  if (!q) return '';
  const p = new URLSearchParams();
  if (q.role) p.set('role', q.role);
  if (q.status) p.set('status', q.status);
  if (q.take != null) p.set('take', String(q.take));
  if (q.skip != null) p.set('skip', String(q.skip));
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function withAuthRetry<T>(
  request: (accessToken: string) => Promise<Response>,
  onErrorPrefix: string
): Promise<T> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();
  if (!accessToken) throw new Error('Sessão inválida. Faça login novamente.');

  let res = await request(accessToken);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await request(newToken);
      }
    } catch {
      const text = await res.text();
      throw new Error(`${onErrorPrefix}: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${onErrorPrefix}: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getBattleTiers(): Promise<BattleTierDto[]> {
  const res = await apiFetch('/battle-tiers');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /battle-tiers: ${res.status} ${text || res.statusText}`);
  }
  const data = (await res.json()) as BattleTiersResponseDto;
  return Array.isArray(data?.tiers) ? data.tiers : [];
}

export async function createBattle(body: CreateBattleBody): Promise<BattleDto> {
  return withAuthRetry<BattleDto>(
    (token) =>
      apiFetch('/battles', {
        method: 'POST',
        userToken: token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    'POST /battles'
  );
}

export async function instantOpenBattle(
  body: InstantOpenBattleBody
): Promise<InstantOpenBattleResponseDto> {
  return withAuthRetry<InstantOpenBattleResponseDto>(
    (token) =>
      apiFetch('/battles/instant-open', {
        method: 'POST',
        userToken: token,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    'POST /battles/instant-open'
  );
}

export async function listBattles(query?: BattleListQuery): Promise<BattleListResponseDto> {
  const qs = buildQueryString(query);
  return withAuthRetry<BattleListResponseDto>(
    (token) => apiFetch(`/battles${qs}`, { userToken: token }),
    `GET /battles${qs}`
  );
}

export async function getBattleById(id: string): Promise<BattleDto> {
  return withAuthRetry<BattleDto>(
    (token) => apiFetch(`/battles/${encodeURIComponent(id)}`, { userToken: token }),
    'GET /battles/:id'
  );
}

export async function acceptBattle(id: string): Promise<BattleDto> {
  return withAuthRetry<BattleDto>(
    (token) =>
      apiFetch(`/battles/${encodeURIComponent(id)}/accept`, {
        method: 'POST',
        userToken: token,
      }),
    'POST /battles/:id/accept'
  );
}

export async function declineBattle(id: string): Promise<BattleDto> {
  return withAuthRetry<BattleDto>(
    (token) =>
      apiFetch(`/battles/${encodeURIComponent(id)}/decline`, {
        method: 'POST',
        userToken: token,
      }),
    'POST /battles/:id/decline'
  );
}

export async function cancelBattle(id: string): Promise<void> {
  await withAuthRetry<unknown>(
    (token) =>
      apiFetch(`/battles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        userToken: token,
      }),
    'DELETE /battles/:id'
  );
}

