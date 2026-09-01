import { apiFetch } from './client';

export type TeamShieldsResponse = {
  count: number;
};

/**
 * Quantidade de escudos disponíveis (ids de 1 a count).
 * Rota pública, não requer autenticação (análogo a GET /avatars).
 */
export async function getTeamShieldsCount(): Promise<number> {
  const res = await apiFetch('/team-shields');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /team-shields: ${res.status} ${text || res.statusText}`);
  }
  const data = (await res.json()) as TeamShieldsResponse;
  return typeof data.count === 'number' ? data.count : 0;
}
