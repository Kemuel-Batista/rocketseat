import { Platform } from 'react-native';

import { refreshTokens, type LinkGoogleResponse } from '@/lib/api/authApi';
import { apiConfig } from '@/lib/api/config';
import { apiFetch } from '@/lib/api/client';
import { useUserStore } from '@/store/userStore';

export type LinkGooglePayload = {
  token: string;
  platform: 'ios' | 'android';
};

const DEBUG_LINK_GOOGLE = true;

function maskToken(token: string) {
  if (!token || token.length < 12) return '(empty/short)';
  return `${token.slice(0, 8)}...${token.slice(-4)}`;
}

/** Lê sempre o refresh mais recente do store (rotação invalida o valor local antigo). */
async function refreshAccessFromStore(): Promise<boolean> {
  const rt = useUserStore.getState().refreshToken;
  if (!rt) return false;
  try {
    const data = await refreshTokens(rt);
    await useUserStore.getState().setTokensFromRefresh(data.access_token, data.refresh_token ?? null);
    return true;
  } catch {
    return false;
  }
}

async function postLinkGoogle(payload: LinkGooglePayload, accessToken: string | null) {
  return apiFetch('/auth/link-google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    userToken: accessToken ?? undefined,
  });
}

export async function linkGoogleAccount(idToken: string): Promise<void> {
  const platform = Platform.OS as 'ios' | 'android';
  const payload: LinkGooglePayload = {
    token: idToken,
    platform,
  };

  await useUserStore.getState().hydrateTokens();

  // Access pode ter expirado no browser OAuth; alinhar memória com SecureStore e renovar antes do POST.
  await refreshAccessFromStore();

  let accessToken = useUserStore.getState().accessToken;
  if (!accessToken) {
    throw new Error(
      'Sem sessão de convidado (access_token). Reabre a app e tenta de novo, ou verifica a rede ao criar convidado.'
    );
  }

  const url = `${apiConfig.baseUrl}/auth/link-google`;

  if (DEBUG_LINK_GOOGLE) {
    console.log('[link-google] Request', {
      url,
      platform,
      hasBearer: !!accessToken,
      bearerPreview: accessToken ? maskToken(accessToken) : null,
      tokenPreview: maskToken(idToken),
    });
  }

  let res = await postLinkGoogle(payload, accessToken);

  if (res.status === 401) {
    const refreshed = await refreshAccessFromStore();
    if (refreshed) {
      accessToken = useUserStore.getState().accessToken;
      res = await postLinkGoogle(payload, accessToken);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    if (DEBUG_LINK_GOOGLE) {
      console.log('[link-google] SERVER error (backend responded)', {
        status: res.status,
        statusText: res.statusText,
        body: text || '(empty)',
      });
    }
    throw new Error(`POST /auth/link-google: ${res.status} ${text || res.statusText}`);
  }

  const data = (await res.json()) as LinkGoogleResponse;
  const { setLinkedSession } = useUserStore.getState();
  await setLinkedSession(data);

  if (DEBUG_LINK_GOOGLE) {
    console.log('[link-google] Success', {
      status: res.status,
      message: data.message,
      userId: data.user.id,
    });
  }
}

const DEBUG_LINK_APPLE = true;

export type LinkApplePayload = {
  token: string;
  platform: 'ios';
};

async function postLinkApple(payload: LinkApplePayload, accessToken: string | null) {
  return apiFetch('/auth/link-appleid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    userToken: accessToken ?? undefined,
  });
}

/**
 * Envia o identityToken da Apple (JWT) para o backend, como no link-google.
 */
export async function linkAppleAccount(identityToken: string): Promise<void> {
  const payload: LinkApplePayload = {
    token: identityToken,
    platform: 'ios',
  };

  await useUserStore.getState().hydrateTokens();
  await refreshAccessFromStore();

  let accessToken = useUserStore.getState().accessToken;
  if (!accessToken) {
    throw new Error(
      'Sem sessão de convidado (access_token). Reabre a app e tenta de novo, ou verifica a rede ao criar convidado.'
    );
  }

  const url = `${apiConfig.baseUrl}/auth/link-appleid`;

  if (DEBUG_LINK_APPLE) {
    console.log('[link-appleid] Request', {
      url,
      platform: payload.platform,
      hasBearer: !!accessToken,
      bearerPreview: accessToken ? maskToken(accessToken) : null,
      tokenPreview: maskToken(identityToken),
    });
  }

  let res = await postLinkApple(payload, accessToken);

  if (res.status === 401) {
    const refreshed = await refreshAccessFromStore();
    if (refreshed) {
      accessToken = useUserStore.getState().accessToken;
      res = await postLinkApple(payload, accessToken);
    }
  }

  if (!res.ok) {
    const text = await res.text();
    if (DEBUG_LINK_APPLE) {
      console.log('[link-appleid] SERVER error', {
        status: res.status,
        statusText: res.statusText,
        body: text || '(empty)',
      });
    }
    throw new Error(`POST /auth/link-appleid: ${res.status} ${text || res.statusText}`);
  }

  const data = (await res.json()) as LinkGoogleResponse;
  const { setLinkedSession } = useUserStore.getState();
  await setLinkedSession(data);

  if (DEBUG_LINK_APPLE) {
    console.log('[link-appleid] Success', {
      status: res.status,
      message: data.message,
      userId: data.user.id,
    });
  }
}
