import pako from 'pako';
import {
  getPlayersVersion,
  downloadPlayersVersionFile,
} from '@/lib/api/adminApi';
import {
  initPlayersDb,
  getLocalPlayersVersion,
  setLocalPlayersVersion,
  upsertPlayers,
} from '@/lib/db/playersDb';
import { seedFromBundleIfNeeded } from '@/lib/sync/seedFromBundle';
import type { PlayerRow } from '@/types/player';

const BATCH_SIZE = 500;

export type SyncResult =
  | { ok: true; version: number; imported: number }
  | { ok: false; error: string };

/** Converte qualquer erro em mensagem legível (inclui causa quando existir). */
function toErrorMessage(step: string, e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const name = e instanceof Error ? e.name : '';
  const cause = e instanceof Error && e.cause instanceof Error ? e.cause.message : '';
  const parts = [`${step}: ${msg}`];
  if (name && name !== 'Error') parts.push(`(${name})`);
  if (cause) parts.push(`Causa: ${cause}`);
  return parts.join(' ');
}

/**
 * Garante base local: se versão 0, importa do bundle (app de fábrica).
 * Depois verifica se existe versão mais nova no servidor e, se existir,
 * baixa o NDJSON gzip, descompacta e faz upsert no SQLite (INSERT OR REPLACE).
 * Nunca removemos jogadores: só inserir ou atualizar (INSERT OR REPLACE).
 * Pode ser chamado em segundo plano (ex.: AppState change, intervalo).
 */
export async function syncPlayersDatabase(): Promise<SyncResult> {
  try {
    initPlayersDb();
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Inicialização do banco', e),
    };
  }

  try {
    await seedFromBundleIfNeeded();
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Importar base do app', e),
    };
  }

  let localVersion: number;
  try {
    localVersion = getLocalPlayersVersion();
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Ler versão local', e),
    };
  }

  let versionInfo;
  try {
    versionInfo = await getPlayersVersion(localVersion);
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Consultar servidor (versão)', e),
    };
  }

  if (!versionInfo.downloadUrl || versionInfo.version <= localVersion) {
    return { ok: true, version: localVersion, imported: 0 };
  }

  const version = versionInfo.version;
  let buffer: ArrayBuffer;
  try {
    buffer = await downloadPlayersVersionFile(version);
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Download da base', e),
    };
  }

  let text: string;
  try {
    const inflated = pako.inflate(new Uint8Array(buffer));
    text = new TextDecoder('utf-8').decode(inflated);
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Descompactar arquivo', e),
    };
  }

  const lines = text.split('\n').filter((line) => line.trim());
  const rows: PlayerRow[] = [];
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as PlayerRow;
      if (row && typeof row.id === 'number') {
        rows.push(row);
      }
    } catch {
      // skip invalid lines
    }
  }

  try {
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      upsertPlayers(batch, { preserveFoundCount: true });
    }
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage(
        'Gravar no banco (pode ser schema desatualizado: desinstale o app e instale de novo, ou limpe os dados)',
        e
      ),
    };
  }

  try {
    setLocalPlayersVersion(version);
  } catch (e) {
    return {
      ok: false,
      error: toErrorMessage('Atualizar versão local', e),
    };
  }

  return { ok: true, version, imported: rows.length };
}
