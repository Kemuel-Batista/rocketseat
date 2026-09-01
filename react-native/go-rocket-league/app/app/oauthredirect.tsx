import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

/**
 * Destino do redirect OAuth (`com.gorocketleague://oauthredirect`).
 * O ficheiro tem de existir para o Expo Router não mostrar "Unmatched Route";
 * `maybeCompleteAuthSession` associa o URL ao pedido em curso do expo-auth-session.
 *
 * Preferimos `back()` para voltar ao ecrã que abriu o browser (ex.: onboarding), para o
 * `promptAsync` do Google fechar corretamente; se não houver histórico, vamos à raiz.
 */
export default function OAuthRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
    const t = setTimeout(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }, 0);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
