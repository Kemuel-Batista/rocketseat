import { refreshTokens } from './authApi';
import { apiFetch } from './client';
import { useUserStore } from '@/store/userStore';

export type AvatarsResponse = {
  count: number;
};

/**
 * Retorna a quantidade de avatares disponíveis (ids de 1 a count).
 * Rota pública, não requer autenticação.
 */
export async function getAvatarsCount(): Promise<number> {
  const res = await apiFetch('/avatars');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /avatars: ${res.status} ${text || res.statusText}`);
  }
  const data = (await res.json()) as AvatarsResponse;
  return data.count;
}

export type UpdateUserBody = {
  username?: string;
  avatarId?: number;
};

async function patchUser(body: UpdateUserBody, accessToken: string): Promise<Response> {
  return apiFetch('/user', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    userToken: accessToken,
  });
}

/**
 * Atualiza dados do usuário (username e/ou avatarId).
 * Nenhum campo é obrigatório. Requer autenticação (Bearer).
 * Em caso de 401, tenta refresh do token e repete a requisição uma vez.
 */
export async function updateUser(body: UpdateUserBody): Promise<void> {
  const { accessToken, refreshToken, setTokensFromRefresh } = useUserStore.getState();

  if (!accessToken) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  let res = await patchUser(body, accessToken);

  if (res.status === 401 && refreshToken) {
    try {
      const data = await refreshTokens(refreshToken);
      await setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
      const newToken = useUserStore.getState().accessToken;
      if (newToken) {
        res = await patchUser(body, newToken);
      }
    } catch {
      const text = await res.text();
      throw new Error(`PATCH /user: 401 ${text || res.statusText}`);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH /user: ${res.status} ${text || res.statusText}`);
  }
}
