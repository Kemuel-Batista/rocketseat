import { apiConfig } from './config';

export type RequestInitWithAuth = RequestInit & {
  /** Token JWT do usuário (rotas autenticadas de usuário) */
  userToken?: string;
  /** Chave admin (rotas de sync: versão da base, download) */
  adminKey?: string;
};

function buildHeaders(init?: RequestInitWithAuth): HeadersInit {
  const headers = new Headers(init?.headers);

  if (init?.adminKey) {
    headers.set('x-admin-token', init.adminKey);
  }
  if (init?.userToken) {
    headers.set('Authorization', `Bearer ${init.userToken}`);
  }

  return headers;
}

/**
 * Fetch para a API.
 * - Use adminKey para rotas admin (ex.: GET /players/version, download).
 * - Use userToken para rotas de usuário autenticado (futuro).
 */
export async function apiFetch(
  path: string,
  init?: RequestInitWithAuth
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${apiConfig.baseUrl}${path}`;
  const headers = buildHeaders(init);

  return fetch(url, {
    ...init,
    headers: {
      ...Object.fromEntries(new Headers(init?.headers)),
      ...Object.fromEntries(new Headers(headers)),
    },
  });
}
