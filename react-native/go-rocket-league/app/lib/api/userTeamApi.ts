import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { apiConfig } from './config';
import type { BattleStakeTier } from './battlesApi';
import type { UserInstanceDto } from './userInstancesApi';
import { useUserStore } from '@/store/userStore';

/**
 * Time na listagem `GET /teams/leaderboard?onlyOpenForBattle=true` (Desafios → POST /battles).
 * USER_BATTLES_API.md
 */
export type OpenBattleTeamRow = {
  userId: string;
  username: string;
  avatarId: number;
  teamId: string;
  teamName: string;
  overall: number;
  stakeTier: BattleStakeTier;
  stakeCoins: number;
  /** Escudo do time (`GET /teams/leaderboard` — USER_TEAM_API.md). */
  shieldId: number | null;
  shieldUrl: string | null;
};

const TIER_COINS: Record<BattleStakeTier, number> = {
  COINS_10: 10,
  COINS_50: 50,
  COINS_100: 100,
  COINS_1000: 1000,
};

function isStakeTier(v: unknown): v is BattleStakeTier {
  return (
    v === 'COINS_10' || v === 'COINS_50' || v === 'COINS_100' || v === 'COINS_1000'
  );
}

/** Alinhado a USER_BATTLES_API / listagens com paginação (take máx. típico 100). */
const LEADERBOARD_PAGE_SIZE = 100;

function extractLeaderboardRows(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.teams)) return o.teams;
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.results)) return o.results;
  if (Array.isArray(o.rows)) return o.rows;
  if (Array.isArray(o.leaderboard)) return o.leaderboard;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    if (Array.isArray(inner.items)) return inner.items;
    if (Array.isArray(inner.teams)) return inner.teams;
    if (Array.isArray(inner.data)) return inner.data;
  }
  return [];
}

function readTotalFromLeaderboardPayload(data: unknown): number | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  const t = o.total;
  if (typeof t === 'number' && Number.isFinite(t)) return t;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    const tt = inner.total;
    if (typeof tt === 'number' && Number.isFinite(tt)) return tt;
  }
  return undefined;
}

function nestedRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function mapLeaderboardRow(raw: unknown): OpenBattleTeamRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  /** USER_TEAM_API.md `GET /teams/leaderboard`: dono em `user`, não só `owner`. */
  const user = nestedRecord(r.user) ?? nestedRecord(r.owner);
  const owner = nestedRecord(r.owner);
  const battle = nestedRecord(r.battle) ?? nestedRecord(r.openBattle) ?? nestedRecord(r.battlePrefs);

  const userId = String(
    r.ownerId ??
      r.owner_id ??
      r.userId ??
      r.user_id ??
      user?.id ??
      owner?.id ??
      ''
  ).trim();
  if (!userId) return null;

  const username =
    String(
      r.ownerUsername ??
        r.owner_username ??
        user?.username ??
        owner?.username ??
        r.username ??
        ''
    ).trim() || 'Player';
  const avatarRaw =
    user?.avatarId ?? user?.avatar_id ?? owner?.avatarId ?? owner?.avatar_id ?? r.avatarId ?? r.avatar_id;
  const avatarId = Number(avatarRaw);
  const teamId = String(r.id ?? r.teamId ?? r.team_id ?? '').trim() || userId;
  const teamName = String(r.name ?? r.teamName ?? r.team_name ?? '').trim() || 'Team';
  const overall = Number(r.overall ?? 0);

  const tierRaw =
    r.openBattleStakeTier ??
    r.open_battle_stake_tier ??
    battle?.openBattleStakeTier ??
    battle?.open_battle_stake_tier ??
    r.stakeTier ??
    r.stake_tier ??
    r.openBattleTier ??
    r.open_battle_tier;
  let stakeTier: BattleStakeTier | null = isStakeTier(tierRaw) ? tierRaw : null;

  let stakeCoins = Number(
    r.openBattleStakeCoins ??
      r.open_battle_stake_coins ??
      battle?.openBattleStakeCoins ??
      battle?.open_battle_stake_coins ??
      r.stakeCoins ??
      r.stake_coins
  );
  if (stakeTier && (!Number.isFinite(stakeCoins) || stakeCoins <= 0)) {
    stakeCoins = TIER_COINS[stakeTier];
  }
  if (!stakeTier && Number.isFinite(stakeCoins) && stakeCoins > 0) {
    const match = (Object.keys(TIER_COINS) as BattleStakeTier[]).find(
      (k) => TIER_COINS[k] === stakeCoins
    );
    stakeTier = match ?? null;
  }
  if (!stakeTier || !Number.isFinite(stakeCoins) || stakeCoins <= 0) {
    return null;
  }

  const shieldIdRaw = r.shieldId ?? r.shield_id;
  const shieldIdNum = Number(shieldIdRaw);
  const shieldId =
    Number.isFinite(shieldIdNum) && shieldIdNum > 0 ? Math.floor(shieldIdNum) : null;
  const su = r.shieldUrl ?? r.shield_url;
  const shieldUrl =
    typeof su === 'string' && su.trim() ? String(su).trim() : null;

  return {
    userId,
    username,
    avatarId: Number.isFinite(avatarId) ? Math.floor(avatarId) : 1,
    teamId,
    teamName,
    overall: Number.isFinite(overall) ? overall : 0,
    stakeTier,
    stakeCoins: Math.floor(stakeCoins),
    shieldId,
    shieldUrl,
  };
}

export type UserTeamSlotDto = {
  slotIndex: number;
  instance: UserInstanceDto;
};

export type NationalitySynergyDto = {
  nation: string;
  count: number;
  bonusPercent: number;
};

export type UserTeamDto = {
  id: string;
  name: string;
  overall: number;
  baseOverallSum: number;
  nationalityBonusPercent: number;
  maxSameNationCount: number;
  nationalitySynergy?: NationalitySynergyDto[];
  shieldId?: number | null;
  shieldUrl?: string | null;
  globalRank: number | null;
  wins: number;
  losses: number;
  createdAt: string;
  updatedAt: string;
  slots: UserTeamSlotDto[];
  /** Batalhas: `PATCH /user/team/battle-settings` + refletido no GET (USER_TEAM_API.md). */
  openForBattle?: boolean;
  openBattleStakeTier?: BattleStakeTier;
  openBattleStakeCoins?: number;
  /** Algumas respostas podem espelhar o tier como `stakeTier`. */
  stakeTier?: BattleStakeTier;
  /** Piso de saldo: abaixo disto o backend desliga `openForBattle` após batalhas (`null` = sem piso). */
  openBattleMinBalance?: number | null;
};

export type PatchUserTeamBody = {
  name?: string;
  instanceIds?: string[];
  /** `null` remove o escudo (se a API permitir). */
  shieldId?: number | null;
};

/**
 * `PATCH /user/team/battle-settings` (USER_TEAM_API.md).
 * Pelo menos um de `openForBattle`, `stakeTier` ou `openBattleMinBalance`; com `openForBattle=true` é obrigatório `stakeTier` no mesmo pedido.
 */
export type PatchUserTeamBattleSettingsBody = {
  openForBattle?: boolean;
  stakeTier?: BattleStakeTier | null;
  openBattleMinBalance?: number | null;
};

/** Corpo conforme regras da doc: fechar só envia `openForBattle: false`; abrir envia tier + piso opcional no mesmo request. */
export function buildBattleSettingsBody(
  openForBattle: boolean,
  stakeTierWhenOpen: BattleStakeTier,
  openBattleMinBalance: number | null
): PatchUserTeamBattleSettingsBody {
  if (!openForBattle) {
    return { openForBattle: false };
  }
  return {
    openForBattle: true,
    stakeTier: stakeTierWhenOpen,
    openBattleMinBalance,
  };
}

/** Normaliza campos de batalha devolvidos pelo `GET/PATCH /user/team`. */
export function battlePrefsFromTeamDto(team: UserTeamDto | null): {
  openForBattle: boolean;
  openBattleStakeTier: BattleStakeTier;
  openBattleMinBalance: number | null;
} {
  const defaultTier: BattleStakeTier = 'COINS_10';
  if (!team) {
    return { openForBattle: false, openBattleStakeTier: defaultTier, openBattleMinBalance: null };
  }
  const tierRaw = team.openBattleStakeTier ?? team.stakeTier;
  const openBattleStakeTier =
    tierRaw != null && isStakeTier(tierRaw) ? tierRaw : defaultTier;
  const rawMin = team.openBattleMinBalance;
  let openBattleMinBalance: number | null = null;
  if (rawMin != null) {
    const n = typeof rawMin === 'number' ? rawMin : Number(rawMin);
    if (Number.isFinite(n) && n >= 0) {
      openBattleMinBalance = Math.floor(n);
    }
  }
  return {
    openForBattle: Boolean(team.openForBattle),
    openBattleStakeTier,
    openBattleMinBalance,
  };
}

async function getUserTeamRequest(accessToken: string): Promise<Response> {
  return apiFetch('/user/team', { userToken: accessToken });
}

async function patchUserTeamRequest(
  accessToken: string,
  body: PatchUserTeamBody
): Promise<Response> {
  return apiFetch('/user/team', {
    method: 'PATCH',
    userToken: accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patchUserTeamBattleSettingsRequest(
  accessToken: string,
  body: PatchUserTeamBattleSettingsBody
): Promise<Response> {
  return apiFetch('/user/team/battle-settings', {
    method: 'PATCH',
    userToken: accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Time do usuário. `null` se 404 (ainda sem time).
 */
export async function getUserTeam(): Promise<UserTeamDto | null> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await getUserTeamRequest(accessToken);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await getUserTeamRequest(newToken);
      }
    } catch {
      const text = await res.text();
      throw new Error(`GET /user/team: 401 ${text || res.statusText}`);
    }
  }

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /user/team: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<UserTeamDto>;
}

export async function patchUserTeam(body: PatchUserTeamBody): Promise<UserTeamDto> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await patchUserTeamRequest(accessToken, body);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await patchUserTeamRequest(newToken, body);
      }
    } catch {
      const text = await res.text();
      throw new Error(`PATCH /user/team: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH /user/team: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<UserTeamDto>;
}

export async function patchUserTeamBattleSettings(
  body: PatchUserTeamBattleSettingsBody
): Promise<UserTeamDto> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await patchUserTeamBattleSettingsRequest(accessToken, body);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await patchUserTeamBattleSettingsRequest(newToken, body);
      }
    } catch {
      const text = await res.text();
      throw new Error(`PATCH /user/team/battle-settings: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH /user/team/battle-settings: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<UserTeamDto>;
}

/**
 * Uma página do leaderboard (para paginação explícita `take` / `skip`).
 *
 * **URL:** `GET /teams/leaderboard?onlyOpenForBattle=true&take=…&skip=…` (USER_BATTLES_API.md).
 * Antes só íamos sem `take`/`skip`; alguns backends assumem `take=0` ou formato de resposta diferente.
 */
function summarizeLeaderboardResponseForLog(data: unknown): {
  topLevel: string;
  keys?: string[];
  extractedRowCount: number;
  firstRowKeys?: string[];
  firstRowHasUser?: boolean;
  totalField?: unknown;
} {
  const rows = extractLeaderboardRows(data);
  let firstRowKeys: string[] | undefined;
  const first = rows[0];
  let firstRowHasUser: boolean | undefined;
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    firstRowKeys = Object.keys(first as object);
    firstRowHasUser = 'user' in (first as object);
  }
  let totalField: unknown;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    totalField = o.total;
  }
  return {
    topLevel: Array.isArray(data) ? `array(len=${data.length})` : typeof data,
    keys:
      data && typeof data === 'object' && !Array.isArray(data)
        ? Object.keys(data as object)
        : undefined,
    extractedRowCount: rows.length,
    firstRowKeys,
    firstRowHasUser,
    totalField,
  };
}

async function fetchTeamsLeaderboardOpenForBattlePage(skip: number): Promise<unknown> {
  const queryParams = {
    onlyOpenForBattle: 'true',
    take: String(LEADERBOARD_PAGE_SIZE),
    skip: String(skip),
  } as const;
  const path = `/teams/leaderboard?${new URLSearchParams(queryParams).toString()}`;
  const fullUrl = path.startsWith('http') ? path : `${apiConfig.baseUrl}${path}`;

  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  console.log('[GoRocketLeague][GET /teams/leaderboard]', {
    method: 'GET',
    path,
    url: fullUrl,
    queryParams: { ...queryParams },
    baseUrl: apiConfig.baseUrl,
    hasAuthorization: true,
  });

  let res = await apiFetch(path, { userToken: accessToken });

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        console.log('[GoRocketLeague][GET /teams/leaderboard] retry after 401 refresh');
        res = await apiFetch(path, { userToken: newToken });
      }
    } catch {
      const text = await res.text();
      throw new Error(`GET ${path}: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    console.log('[GoRocketLeague][GET /teams/leaderboard] error response', {
      path,
      status: res.status,
      statusText: res.statusText,
      bodyPreview: text.slice(0, 500),
    });
    throw new Error(`GET ${path}: ${res.status} ${text || res.statusText}`);
  }

  const data: unknown = await res.json();
  const summary = summarizeLeaderboardResponseForLog(data);
  console.log('[GoRocketLeague][GET /teams/leaderboard] response', {
    path,
    httpStatus: res.status,
    ...summary,
    firstRowSampleKeys: summary.firstRowKeys?.slice(0, 30),
    /** Se `items` vierem mas `mappedOk` for 0, verificar `user.id` + `openBattleStakeTier` (USER_TEAM_API). */
    firstRowHasUser: summary.firstRowHasUser,
  });
  return data;
}

/**
 * Lista times com batalha aberta (preço definido pelo dono).
 * Agrega todas as páginas até `take` devolver menos que o tamanho da página ou `total` ser atingido.
 */
export async function getTeamsLeaderboardOpenForBattle(): Promise<OpenBattleTeamRow[]> {
  const out: OpenBattleTeamRow[] = [];
  const seenTeam = new Set<string>();
  let skip = 0;
  const maxPages = 100;

  for (let page = 0; page < maxPages; page++) {
    const data = await fetchTeamsLeaderboardOpenForBattlePage(skip);
    const rows = extractLeaderboardRows(data);
    const total = readTotalFromLeaderboardPayload(data);

    let mappedThisPage = 0;
    let droppedThisPage = 0;
    for (const row of rows) {
      const m = mapLeaderboardRow(row);
      if (m && !seenTeam.has(m.teamId)) {
        seenTeam.add(m.teamId);
        out.push(m);
        mappedThisPage++;
      } else if (!m) {
        droppedThisPage++;
      }
    }

    console.log('[GoRocketLeague][GET /teams/leaderboard] page mapped', {
      page,
      skip,
      rowsInResponse: rows.length,
      mappedOk: mappedThisPage,
      droppedByMapper: droppedThisPage,
      totalFromPayload: total,
      cumulativeUniqueTeams: out.length,
    });

    if (rows.length === 0) break;
    if (rows.length < LEADERBOARD_PAGE_SIZE) break;
    if (total != null && skip + rows.length >= total) break;
    skip += LEADERBOARD_PAGE_SIZE;
  }

  console.log('[GoRocketLeague][GET /teams/leaderboard] done', {
    openBattleTeamRows: out.length,
  });

  return out;
}
