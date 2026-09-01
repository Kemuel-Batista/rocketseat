import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export type TradeParty = {
  id: string;
  username: string;
};

export type TradeInstanceCard = {
  id: number;
  name: string;
  ovr: number;
  url: string;
  maxSupply: number;
  nation?: string | null;
  team?: string | null;
};

export type TradeInstance = {
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
  foundWhere: {
    city: string | null;
    state: string | null;
    lat: number;
    lng: number;
  } | null;
  spawnLocation: {
    lat: number;
    lng: number;
    h3RoomCell: string;
  } | null;
  card: TradeInstanceCard;
};

export type TradeProposal = {
  id: string;
  status: TradeStatus;
  initiator: TradeParty;
  counterparty: TradeParty;
  offerFromInitiator: TradeInstance[];
  offerFromCounterparty: TradeInstance[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTradeBody = {
  counterpartyId: string;
  offerInstanceIds: string[];
  requestInstanceIds: string[];
};

export type GetTradesParams = {
  role?: 'initiator' | 'counterparty' | 'all';
  status?: TradeStatus;
  take?: number;
  skip?: number;
};

export type GetTradesResponse = {
  items: TradeProposal[];
  total: number;
  take: number;
  skip: number;
};

async function withAuthRetry<T>(fn: (accessToken: string) => Promise<Response>): Promise<T> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();
  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await fn(accessToken);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await fn(newToken);
      }
    } catch {
      const text = await res.text();
      throw new Error(`Trades auth error: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trades request failed: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function createTrade(body: CreateTradeBody): Promise<TradeProposal> {
  return withAuthRetry<TradeProposal>((accessToken) =>
    apiFetch('/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      userToken: accessToken,
    })
  );
}

export async function getTrades(params: GetTradesParams = {}): Promise<GetTradesResponse> {
  const search = new URLSearchParams();
  if (params.role) search.set('role', params.role);
  if (params.status) search.set('status', params.status);
  if (typeof params.take === 'number') search.set('take', String(params.take));
  if (typeof params.skip === 'number') search.set('skip', String(params.skip));
  const q = search.toString();
  const path = q ? `/trades?${q}` : '/trades';
  return withAuthRetry<GetTradesResponse>((accessToken) => apiFetch(path, { userToken: accessToken }));
}

export async function acceptTrade(id: string): Promise<TradeProposal> {
  return withAuthRetry<TradeProposal>((accessToken) =>
    apiFetch(`/trades/${id}/accept`, { method: 'POST', userToken: accessToken })
  );
}

export async function declineTrade(id: string): Promise<TradeProposal> {
  return withAuthRetry<TradeProposal>((accessToken) =>
    apiFetch(`/trades/${id}/decline`, { method: 'POST', userToken: accessToken })
  );
}

export async function cancelTrade(id: string): Promise<TradeProposal> {
  return withAuthRetry<TradeProposal>((accessToken) =>
    apiFetch(`/trades/${id}`, { method: 'DELETE', userToken: accessToken })
  );
}
