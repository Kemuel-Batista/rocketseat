import { apiConfig } from './config';

/** URL absoluta do ficheiro de escudo do time (`/public_assets/team_shields/{id}.webp`). */
export function buildTeamShieldUri(id: number): string {
  return `${apiConfig.baseUrl}/public_assets/team_shields/${id}.webp`;
}

/** URLs da API podem vir relativas; o app precisa do host completo para o expo-image. */
export function resolveCardImageUri(uri: string | null | undefined): string | undefined {
  if (!uri || !String(uri).trim()) return undefined;
  const u = String(uri).trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `${apiConfig.baseUrl}${u.startsWith('/') ? '' : '/'}${u}`;
}
