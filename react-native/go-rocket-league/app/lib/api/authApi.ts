import { apiConfig } from './config';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type GuestSessionResponse = {
  id: number;
  access_token: string;
  refresh_token: string;
  avatarId: number;
  expires_in: number;
  username: string;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

export type LinkGoogleUser = {
  id: number;
  username: string;
  avatarId: number;
  email?: string;
  provider?: string;
  providerId?: string;
  is_guest: boolean;
};

export type LinkGoogleResponse = {
  ok: boolean;
  message: 'Account linked successfully' | 'Account already linked; switched to existing user';
  user: LinkGoogleUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

/**
 * Cria um usuário convidado no backend.
 * Requer admin token (x-admin-token).
 * Retorna id, tokens e avatarId para persistir no app.
 */
export async function createGuest(): Promise<GuestSessionResponse> {
  const res = await apiFetch('/auth/guest', {
    method: 'POST',
    adminKey: apiConfig.adminKey,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`auth/guest: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<GuestSessionResponse>;
}

/**
 * Renova o access token usando o refresh token.
 * POST /auth/refresh com body { refresh_token }.
 * Retorna novo access_token e opcionalmente novo refresh_token.
 */
export async function refreshTokens(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const res = await apiFetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`auth/refresh: ${res.status} ${text || res.statusText}`);
  }

  return res.json() as Promise<RefreshTokenResponse>;
}

/**
 * Renova o access token silenciosamente se houver refresh token.
 * Chamar no início do onboarding para garantir token válido na tela de link Google.
 */
export async function ensureValidAccessToken(): Promise<void> {
  const { refreshToken, setTokensFromRefresh } = useUserStore.getState();
  if (!refreshToken) return;
  try {
    const data = await refreshTokens(refreshToken);
    await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
  } catch {
    // falha silenciosa; o token atual continua em uso
  }
}
