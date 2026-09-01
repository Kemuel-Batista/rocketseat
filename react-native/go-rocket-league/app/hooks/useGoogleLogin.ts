import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthSessionResult } from 'expo-auth-session';

import { useGoogleAuthRequest } from '@/lib/auth/googleLogin';
import { linkGoogleAccount } from '@/lib/auth/linkSocialAccount';

type UseGoogleLoginOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

type UseGoogleLoginResult = {
  request: unknown;
  isLoading: boolean;
  error: Error | null;
  hasLinked: boolean;
  startGoogleLogin: () => Promise<AuthSessionResult | void>;
};

function logGoogleLoginFailure(context: string, err: unknown) {
  if (err instanceof Error) {
    // console.log: evita o LogBox vermelho do RN (console.error é tratado como exceção).
    console.log(`[GoogleLogin] ${context}`, {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.log(`[GoogleLogin] ${context}`, err);
  }
}

export function useGoogleLogin(options?: UseGoogleLoginOptions): UseGoogleLoginResult {
  const onSuccessRef = useRef(options?.onSuccess);
  const onErrorRef = useRef(options?.onError);
  onSuccessRef.current = options?.onSuccess;
  onErrorRef.current = options?.onError;

  const { request, response, promptAsync } = useGoogleAuthRequest();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLinked, setHasLinked] = useState(false);

  const startGoogleLogin = useCallback(async () => {
    if (!request) return;

    setError(null);
    setIsLoading(true);

    // Debug: log what we send to Google
    const req = request as { url?: string | null; redirectUri?: string };
    const authUrl = req.url ?? null;
    const redirectUri = req.redirectUri ?? '(unknown)';
    let redirectFromUrl: string | null = null;
    if (authUrl) {
      try {
        const u = new URL(authUrl);
        redirectFromUrl = u.searchParams.get('redirect_uri');
      } catch {
        /* ignore */
      }
    }
    console.log('[Google OAuth DEBUG] Enviando ao Google:', {
      redirect_uri: redirectUri,
      redirect_uri_na_url: redirectFromUrl,
      client_id_na_url: authUrl
        ? (() => {
            try {
              return new URL(authUrl).searchParams.get('client_id');
            } catch {
              return null;
            }
          })()
        : null,
      auth_url_preview: authUrl ? `${authUrl.slice(0, 120)}...` : null,
    });

    try {
      const result = await promptAsync();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start Google login.');
      logGoogleLoginFailure('promptAsync / abrir fluxo Google', err instanceof Error ? err : error);
      setError(error);
      setIsLoading(false);
      onErrorRef.current?.(error);
    }
  }, [promptAsync, request]);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success' && response.authentication?.idToken) {
      const idToken = response.authentication.idToken;
      console.log('[GoogleLink] Google OAuth OK – got idToken, calling backend /auth/link-google');

      (async () => {
        try {
          await linkGoogleAccount(idToken);
          setHasLinked(true);
          onSuccessRef.current?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to link Google account.');
          logGoogleLoginFailure('após voltar do Google – /auth/link-google ou rede', err instanceof Error ? err : error);
          console.log('[GoogleLink] Error after calling backend:', {
            message: error.message,
            is401: error.message.includes('401'),
            source: error.message.includes('/auth/link-google') ? 'SERVER (backend)' : 'other',
          });
          setError(error);
          onErrorRef.current?.(error);
        } finally {
          setIsLoading(false);
        }
      })();
    } else if (response.type === 'success' && !response.authentication?.idToken) {
      console.log('[GoogleLogin] OAuth success sem idToken', {
        hasAuthentication: !!response.authentication,
        params: 'params' in response ? (response as { params?: unknown }).params : undefined,
      });
      setIsLoading(false);
    } else if (response.type === 'error') {
      console.log('[GoogleLogin] resposta OAuth do Google (type=error)', response);
      console.log('[GoogleLink] Google OAuth did not return token', {
        type: response.type,
        response,
        source: 'GOOGLE (OAuth error)',
      });
      setIsLoading(false);
    } else if (response.type === 'dismiss') {
      console.log('[GoogleLink] Google OAuth did not return token', {
        type: response.type,
        source: 'GOOGLE (user cancelled or closed browser)',
      });
      setIsLoading(false);
    }
  }, [response]);

  return {
    request,
    isLoading,
    error,
    hasLinked,
    startGoogleLogin,
  };
}

