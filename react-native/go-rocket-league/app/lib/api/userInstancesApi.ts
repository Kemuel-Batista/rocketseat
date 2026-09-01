import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type UserInstanceCard = {
  id: number;
  name: string;
  ovr: number;
  url: string;
  maxSupply: number;
  /** Clube / time do jogador. */
  team?: string | null;
  /** Nacionalidade / país do jogador (nome ou código reconhecido pelo app). */
  nation?: string | null;
};

export type UserInstanceFoundWhere = {
  city: string | null;
  state: string | null;
  lat: number;
  lng: number;
};

export type UserInstanceSpawnLocation = {
  lat: number;
  lng: number;
  h3RoomCell: string;
};

export type UserInstanceDto = {
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
  foundWhere: UserInstanceFoundWhere | null;
  spawnLocation: UserInstanceSpawnLocation | null;
  card: UserInstanceCard;
};

export type UserInstancesResponse = {
  total: number;
  limit: number;
  offset: number;
  instances: UserInstanceDto[];
};

export type GetUserInstancesParams = {
  limit?: number;
  offset?: number;
  /** Substring no nome do jogador (case-insensitive). */
  search?: string;
  q?: string;
  cardId?: number;
  nation?: string;
  nationality?: string;
  ovrMin?: number;
  ovrMax?: number;
  position?: string;
  spawnSource?: string;
  instanceType?: string;
};

function appendParam(
  search: URLSearchParams,
  key: string,
  value: string | number | undefined
): void {
  if (value === undefined || value === '') return;
  search.set(key, String(value));
}

async function getUserInstancesRequest(
  accessToken: string,
  params: GetUserInstancesParams
): Promise<Response> {
  const search = new URLSearchParams();
  appendParam(search, 'limit', params.limit);
  appendParam(search, 'offset', params.offset);
  appendParam(search, 'search', params.search);
  appendParam(search, 'q', params.q);
  appendParam(search, 'cardId', params.cardId);
  appendParam(search, 'nation', params.nation);
  appendParam(search, 'nationality', params.nationality);
  appendParam(search, 'ovrMin', params.ovrMin);
  appendParam(search, 'ovrMax', params.ovrMax);
  appendParam(search, 'position', params.position);
  appendParam(search, 'spawnSource', params.spawnSource);
  appendParam(search, 'instanceType', params.instanceType);
  const q = search.toString();
  const path = q ? `/user/instances?${q}` : '/user/instances';
  return apiFetch(path, { userToken: accessToken });
}

/**
 * Lista instâncias do usuário autenticado (coleção).
 * Em 401, tenta refresh do token e repete uma vez.
 */
export async function getUserInstances(
  params: GetUserInstancesParams = {}
): Promise<UserInstancesResponse> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await getUserInstancesRequest(accessToken, params);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await getUserInstancesRequest(newToken, params);
      }
    } catch {
      const text = await res.text();
      throw new Error(`GET /user/instances: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /user/instances: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<UserInstancesResponse>;
}

/** Carrega todas as páginas de instâncias (para montagem de time, etc.). */
export async function fetchAllUserInstances(): Promise<UserInstanceDto[]> {
  const all: UserInstanceDto[] = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await getUserInstances({ limit, offset });
    all.push(...res.instances);
    if (res.instances.length < limit || all.length >= res.total) break;
    offset += limit;
  }
  return all;
}
