import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type PlayerInstanceOwner = {
  id: string;
  username: string;
  avatarId: number | null;
};

export type PlayerInstanceCard = {
  id: number;
  name: string;
  ovr: number;
  url: string;
  maxSupply: number;
  nation?: string | null;
  team?: string | null;
};

export type PlayerInstanceFoundWhere = {
  city: string | null;
  state: string | null;
  lat: number;
  lng: number;
};

export type PlayerInstanceSpawnLocation = {
  lat: number;
  lng: number;
  h3RoomCell: string;
};

export type PlayerInstanceDto = {
  id: string;
  cardId: number;
  serialNumber: number;
  serialMax: number;
  serialLabel: string;
  serialClass: string;
  spawnSource: string;
  spawnedAt: string;
  updatedAt: string;
  foundWhen: string | null;
  foundWhere: PlayerInstanceFoundWhere | null;
  spawnLocation: PlayerInstanceSpawnLocation | null;
  card: PlayerInstanceCard;
  owner: PlayerInstanceOwner;
};

export type PlayerInstancesResponse = {
  playerId: number;
  total: number;
  limit: number;
  offset: number;
  instances: PlayerInstanceDto[];
};

export type GetPlayerInstancesParams = {
  limit?: number;
  offset?: number;
  includeMine?: boolean;
};

function appendParam(
  search: URLSearchParams,
  key: string,
  value: string | number | undefined
): void {
  if (value === undefined || value === '') return;
  search.set(key, String(value));
}

async function getPlayerInstancesRequest(
  accessToken: string,
  playerId: number,
  params: GetPlayerInstancesParams
): Promise<Response> {
  const search = new URLSearchParams();
  appendParam(search, 'limit', params.limit);
  appendParam(search, 'offset', params.offset);
  if (params.includeMine) search.set('includeMine', '1');
  const q = search.toString();
  const path = q ? `/players/${playerId}/instances?${q}` : `/players/${playerId}/instances`;
  return apiFetch(path, { userToken: accessToken });
}

/**
 * Lista instâncias encontradas de uma carta para fluxo de trade.
 * Em 401, tenta refresh do token e repete a requisição uma vez.
 */
export async function getPlayerInstances(
  playerId: number,
  params: GetPlayerInstancesParams = {}
): Promise<PlayerInstancesResponse> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await getPlayerInstancesRequest(accessToken, playerId, params);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await getPlayerInstancesRequest(newToken, playerId, params);
      }
    } catch {
      const text = await res.text();
      throw new Error(`GET /players/${playerId}/instances: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /players/${playerId}/instances: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<PlayerInstancesResponse>;
}
