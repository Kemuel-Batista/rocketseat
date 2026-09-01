import '@/polyfills/text-decoder-utf16le';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { DatabaseInitSplash } from '@/components/DatabaseInitSplash';
import { NoSessionScreen } from '@/components/NoSessionScreen';
import { ToastProvider } from '@/components/toast/ToastContainer';
import { createGuest } from '@/lib/api/authApi';
import { apiConfig } from '@/lib/api/config';
import { battlePrefsFromTeamDto, getUserTeam } from '@/lib/api/userTeamApi';
import { initPlayersDb } from '@/lib/db/playersDb';
import { seedFromBundleIfNeeded } from '@/lib/sync/seedFromBundle';
import { syncPlayersDatabase } from '@/lib/sync/playersSync';
import { startPlayersProgressPolling } from '@/lib/sync/playersProgressSync';
import { useUserStore, userStoreRehydrationPromise } from '@/store/userStore';
import mobileAds from 'react-native-google-mobile-ads';

export const unstable_settings = {
  anchor: '(tabs)',
};

type SessionStatus = 'loading' | 'ready' | 'error';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    initPlayersDb();
    seedFromBundleIfNeeded()
      .then(() => setInitializing(false))
      .catch(() => setInitializing(false));
  }, []);

  // Complete OAuth redirect when the app loads or returns to foreground (e.g. from Google login).
  // Must run early on load so the auth session receives the URL; also on focus when app was not killed.
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') WebBrowser.maybeCompleteAuthSession();
    });
    return () => sub.remove();
  }, []);

  const ensureSession = useCallback(async () => {
    setSessionStatus('loading');
    try {
      await userStoreRehydrationPromise;
      const state = useUserStore.getState();
      if (state.userId) {
        await state.hydrateTokens();
        setSessionStatus('ready');
        return;
      }
      console.log('[RootLayout] Calling createGuest', {
        baseUrl: apiConfig.baseUrl,
        path: '/auth/guest',
      });
      const data = await createGuest();
      await state.setGuestSession(data);
      setSessionStatus('ready');
    } catch (err) {
      console.log('[RootLayout] ensureSession error', err);
      setSessionStatus('error');
    }
  }, []);

  useEffect(() => {
    if (initializing) return;
    ensureSession();
  }, [initializing, ensureSession]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      console.log('[RootLayout] Retry createGuest', {
        baseUrl: apiConfig.baseUrl,
        path: '/auth/guest',
      });
      const data = await createGuest();
      await useUserStore.getState().setGuestSession(data);
      setSessionStatus('ready');
    } catch (err) {
      console.log('[RootLayout] handleRetry error', err);
      // mantém tela de erro
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (initializing || sessionStatus !== 'ready') return;

    let lastSyncAt = 0;
    const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h

    const maybeSync = () => {
      const now = Date.now();
      if (now - lastSyncAt < SYNC_INTERVAL_MS) return;
      lastSyncAt = now;
      syncPlayersDatabase().catch(() => {});
    };

    maybeSync();

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') maybeSync();
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [initializing, sessionStatus]);

  useEffect(() => {
    if (initializing || sessionStatus !== 'ready') return;
    const stop = startPlayersProgressPolling();
    return () => stop();
  }, [initializing, sessionStatus]);

  /** Preferências de batalha vêm do `GET /user/team`, não só de cache local. */
  useEffect(() => {
    if (initializing || sessionStatus !== 'ready') return;
    let cancelled = false;
    void (async () => {
      try {
        const team = await getUserTeam();
        if (cancelled) return;
        const prefs = battlePrefsFromTeamDto(team);
        const { setBattleAvailable, setBattleStakeTier } = useUserStore.getState();
        setBattleAvailable(prefs.openForBattle);
        setBattleStakeTier(prefs.openBattleStakeTier);
      } catch {
        // rede / sessão: mantém defaults até próximo GET
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initializing, sessionStatus]);

  useEffect(() => {
    if (initializing || sessionStatus !== 'ready') return;
    void mobileAds()
      .initialize()
      .catch(() => {});
  }, [initializing, sessionStatus]);

  // Splash só até DB + sessão; o Stack mantém-se montado durante `loading` para deep links OAuth
  // (`com.gorocketleague://oauthredirect`) não caírem em "Unmatched Route" ao voltar do browser.
  const showSplash = initializing || (sessionStatus === 'loading' && !initializing);
  const showNavigator = !initializing && sessionStatus !== 'error';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <ToastProvider>
          {showNavigator && (
            <Stack
              screenOptions={{ headerShown: false }}
              initialRouteName="index"
            >
              {/* index redirects to /onboarding during dev; later use userStore onboarding seen */}
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="oauthredirect" options={{ headerShown: false }} />
              <Stack.Screen name="card-details/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="trades/create" options={{ headerShown: false }} />
              <Stack.Screen name="collection" options={{ headerShown: false }} />
              <Stack.Screen name="selection/[team]" options={{ headerShown: false }} />
              <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
              <Stack.Screen name="edit-team" options={{ headerShown: false }} />
              <Stack.Screen name="challenges" options={{ headerShown: false }} />
              <Stack.Screen name="toast-demo" options={{ headerShown: false }} />
            </Stack>
          )}
          {sessionStatus === 'error' && (
            <NoSessionScreen onRetry={handleRetry} retrying={retrying} />
          )}
          {showSplash && <DatabaseInitSplash />}
          <StatusBar style="light" />
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
