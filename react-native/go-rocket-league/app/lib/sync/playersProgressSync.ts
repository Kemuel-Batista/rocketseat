import type { RequestInitWithAuth } from '@/lib/api/client';
import { apiFetch } from '@/lib/api/client';
import { apiConfig } from '@/lib/api/config';
import { emitPlayersProgressUpdates } from '@/lib/playersProgressChannel';
import {
  applyPlayersProgressUpdates,
  getCardsProgressVersion,
  initPlayersDb,
  setCardsProgressVersion,
} from '@/lib/db/playersDb';

export type PlayerProgressUpdateResponse = {
  id: number;
  progress_version: string | number;
  max_supply: number;
  found_count: number;
};

async function fetchPlayersProgress(
  version: number
): Promise<PlayerProgressUpdateResponse[]> {
  const path = `/admin/players/progress?version=${version}`;
  const init: RequestInitWithAuth = {
    method: 'GET',
    adminKey: apiConfig.adminKey,
  };
  const res = await apiFetch(path, init);

  if (!res.ok) {
    throw new Error(`players/progress: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<PlayerProgressUpdateResponse[]>;
}

/**
 * Consulta o progresso de cartas no servidor a partir da versão local
 * e aplica os updates de max_supply / found_count no SQLite.
 * Também atualiza a cards_progress_version em app_metadata.
 */
export async function syncPlayersProgressOnce(): Promise<void> {
  initPlayersDb();

  const localVersion = getCardsProgressVersion();
  const updates = await fetchPlayersProgress(localVersion);
  if (!updates.length) return;

  // Atualiza campos por jogador
  const payload = updates.map((u) => ({
    id: u.id,
    maxSupply: u.max_supply ?? null,
    foundCount: u.found_count ?? null,
  }));
  applyPlayersProgressUpdates(payload);

  // Dispara evento para cartas visíveis atualizarem a UI em tempo real
  emitPlayersProgressUpdates(
    payload.map((u) => ({
      id: u.id,
      foundCount: u.foundCount ?? 0,
      maxSupply: u.maxSupply ?? 0,
    }))
  );

  // Atualiza versão global de progresso com o maior progress_version retornado
  const latestVersion = updates.reduce((max, u) => {
    const v = typeof u.progress_version === 'string'
      ? parseInt(u.progress_version, 10)
      : Number(u.progress_version ?? 0);
    return Number.isFinite(v) && v > max ? v : max;
  }, localVersion);

  if (latestVersion > localVersion) {
    setCardsProgressVersion(latestVersion);
  }
}

/**
 * Inicia um polling em background que consulta o progresso de minuto em minuto.
 * Retorna uma função de cleanup para parar o polling.
 */
export function startPlayersProgressPolling(): () => void {
  const INTERVAL_MS = 60 * 1000;
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    try {
      await syncPlayersProgressOnce();
    } catch {
      // silencioso por enquanto; futuro: log / notificações
    }
  };

  // dispara imediatamente na inicialização
  tick();
  const intervalId = setInterval(tick, INTERVAL_MS);

  return () => {
    stopped = true;
    clearInterval(intervalId);
  };
}

