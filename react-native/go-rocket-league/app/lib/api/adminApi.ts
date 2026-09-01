import { apiConfig } from './config';
import { apiFetch } from './client';

export type PlayersVersionResponse = {
  version: number;
  updatedAt: string | null;
  /** Preenchido quando existe versão mais nova e arquivo disponível para download */
  downloadUrl?: string;
};

/**
 * Consulta versão da base de jogadores no servidor.
 * Se localVersion for menor que a do servidor, a resposta inclui downloadUrl.
 */
export async function getPlayersVersion(
  localVersion?: number
): Promise<PlayersVersionResponse> {
  const url =
    localVersion != null
      ? `/players/version?localVersion=${localVersion}`
      : '/players/version';
  const res = await apiFetch(url, {
    method: 'GET',
    adminKey: apiConfig.adminKey,
  });

  if (!res.ok) {
    throw new Error(`players/version: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<PlayersVersionResponse>;
}

/**
 * Baixa o arquivo da versão (NDJSON gzip).
 * Retorna o body como ArrayBuffer (para descompactar no cliente).
 */
export async function downloadPlayersVersionFile(
  version: number
): Promise<ArrayBuffer> {
  const path = `/players/versions/${version}/download`;
  const res = await apiFetch(path, {
    method: 'GET',
    adminKey: apiConfig.adminKey,
  });

  if (!res.ok) {
    throw new Error(`download version ${version}: ${res.status} ${res.statusText}`);
  }

  return res.arrayBuffer();
}
