import * as AppleAuthentication from 'expo-apple-authentication';
import { useCallback, useState } from 'react';

import { linkAppleAccount } from '@/lib/auth/linkSocialAccount';

type UseAppleLoginOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useAppleLogin(options?: UseAppleLoginOptions) {
  const { onSuccess, onError } = options ?? {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLinked, setHasLinked] = useState(false);

  const startAppleLogin = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        const err = new Error('Apple não retornou identityToken.');
        setError(err);
        onError?.(err);
        setIsLoading(false);
        return;
      }

      await linkAppleAccount(identityToken);
      setHasLinked(true);
      onSuccess?.();
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e
          ? String((e as { code?: string }).code)
          : '';
      if (code === 'ERR_REQUEST_CANCELED') {
        setIsLoading(false);
        return;
      }
      const err =
        e instanceof Error ? e : new Error('Falha ao vincular conta Apple.');
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onSuccess]);

  return {
    isLoading,
    error,
    hasLinked,
    startAppleLogin,
  };
}
