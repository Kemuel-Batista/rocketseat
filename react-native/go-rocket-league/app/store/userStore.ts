import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GuestSessionResponse, LinkGoogleResponse } from '@/lib/api/authApi';
import type { FuelDepletedPayload } from '@/lib/colyseus/types';

const USER_SESSION_KEY = 'user-session';
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/** Resolve quando o persist do Zustand terminar de rehidratar (para aguardar no _layout). */
let resolveRehydration: () => void;
export const userStoreRehydrationPromise = new Promise<void>((r) => {
  resolveRehydration = r;
});

const defaultFuel = 100;
const defaultXp = 0;
const defaultLevel = 1;
const defaultFlagsOwned = 0;
const defaultOwnedAreaKm2 = 0;
const defaultCoinBalance = 0;
const defaultBattleAvailable = false;
const defaultBattleStakeTier: 'COINS_10' | 'COINS_50' | 'COINS_100' | 'COINS_1000' = 'COINS_10';

export type FuelRuntimeState = {
  maxFuel: number;
  refillInterval: number;
  lastRefillAt: number;
  lastFuelUpdateAt: number;
  refillActive: boolean;
  refillGranted: number;
};

/** Dados persistidos no AsyncStorage (Zustand). Tokens ficam só no SecureStore. */
export type UserSessionState = {
  userId: number | null;
  /** Em memória; lido do SecureStore na rehidratação. Não persiste no AsyncStorage. */
  accessToken: string | null;
  refreshToken: string | null;
  avatarId: number | null;
  expiresIn: number;
  isGuest: boolean;
  fuel: number;
  xp: number;
  level: number;
  flagsOwned: number;
  ownedAreaKm2: number;
  /** Saldo de moedas (wallet); atualizado via `roomCoinGranted` ou API futura. */
  coinBalance: number;
  /** Batalhas: espelho do `GET/PATCH /user/team` (não persistir só no cliente). */
  battleAvailable: boolean;
  battleStakeTier: 'COINS_10' | 'COINS_50' | 'COINS_100' | 'COINS_1000';
  /** Usuários próximos (runtime, vem do Colyseus no mapa). Não persiste. */
  nearbyUsers: { id: string; username: string; avatarId: string; level: number }[];
  fuelRuntime: FuelRuntimeState;
  fuelRecharge: Omit<FuelDepletedPayload, 'fuel'> | null;
  username: string | null;
  /** Email da conta vinculada (Google/Apple); null para guest. */
  email: string | null;
};

type UserSessionActions = {
  setGuestSession: (data: GuestSessionResponse) => Promise<void>;
  /** Substitui a sessão atual pelos dados do usuário linkado (novo ou já existente). Usado após link Google. */
  setLinkedSession: (data: LinkGoogleResponse) => Promise<void>;
  setFuel: (fuel: number) => void;
  setXp: (xp: number) => void;
  setLevel: (level: number) => void;
  setFlagsOwned: (flagsOwned: number) => void;
  setOwnedAreaKm2: (ownedAreaKm2: number) => void;
  setCoinBalance: (coinBalance: number) => void;
  /** Soma ao saldo local (ex.: recompensa de anúncio). */
  addCoinBalance: (delta: number) => void;
  setBattleAvailable: (battleAvailable: boolean) => void;
  setBattleStakeTier: (battleStakeTier: UserSessionState['battleStakeTier']) => void;
  setNearbyUsers: (nearbyUsers: UserSessionState['nearbyUsers']) => void;
  setFuelRuntime: (fuelRuntime: Partial<FuelRuntimeState>) => void;
  setFuelRecharge: (fuelRecharge: Omit<FuelDepletedPayload, 'fuel'> | null) => void;
  setUsername: (username: string | null) => void;
  setAvatarId: (avatarId: number | null) => void;
  clearSession: () => Promise<void>;
  /** Carrega access_token e refresh_token do SecureStore para a memória (chamar após rehidratar). */
  hydrateTokens: () => Promise<void>;
  /** Atualiza tokens após refresh: persiste no SecureStore e no state. */
  setTokensFromRefresh: (accessToken: string, refreshToken?: string | null) => Promise<void>;
  hasSession: () => boolean;
};

const initialState: UserSessionState = {
  userId: null,
  accessToken: null,
  refreshToken: null,
  avatarId: null,
  expiresIn: 0,
  isGuest: false,
  fuel: defaultFuel,
  xp: defaultXp,
  level: defaultLevel,
  flagsOwned: defaultFlagsOwned,
  ownedAreaKm2: defaultOwnedAreaKm2,
  coinBalance: defaultCoinBalance,
  battleAvailable: defaultBattleAvailable,
  battleStakeTier: defaultBattleStakeTier,
  nearbyUsers: [],
  fuelRuntime: {
    maxFuel: 100,
    refillInterval: 300000,
    lastRefillAt: 0,
    lastFuelUpdateAt: 0,
    refillActive: false,
    refillGranted: 0,
  },
  fuelRecharge: null,
  username: null,
  email: null,
};

export const useUserStore = create<UserSessionState & UserSessionActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setGuestSession: async (data) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh_token);
        set({
          userId: data.id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          avatarId: data.avatarId,
          expiresIn: data.expires_in,
          isGuest: true,
          fuel: defaultFuel,
          xp: defaultXp,
          level: defaultLevel,
          flagsOwned: defaultFlagsOwned,
          ownedAreaKm2: defaultOwnedAreaKm2,
          coinBalance: defaultCoinBalance,
          battleAvailable: defaultBattleAvailable,
          battleStakeTier: defaultBattleStakeTier,
          fuelRuntime: initialState.fuelRuntime,
          fuelRecharge: null,
          username: data.username,
          email: null,
        });
      },

      setLinkedSession: async (data) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh_token);
        const { user } = data;
        set({
          userId: user.id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          avatarId: user.avatarId,
          expiresIn: data.expires_in,
          isGuest: user.is_guest,
          fuel: defaultFuel,
          xp: defaultXp,
          level: defaultLevel,
          flagsOwned: defaultFlagsOwned,
          ownedAreaKm2: defaultOwnedAreaKm2,
          coinBalance: defaultCoinBalance,
          battleAvailable: defaultBattleAvailable,
          battleStakeTier: defaultBattleStakeTier,
          fuelRuntime: initialState.fuelRuntime,
          fuelRecharge: null,
          username: user.username,
          email: user.email ?? null,
        });
      },

      setFuel: (fuel) => set({ fuel }),
      setXp: (xp) => set({ xp }),
      setLevel: (level) => set({ level }),
      setFlagsOwned: (flagsOwned) => set({ flagsOwned }),
      setOwnedAreaKm2: (ownedAreaKm2) => set({ ownedAreaKm2 }),
      setCoinBalance: (coinBalance) => set({ coinBalance }),
      addCoinBalance: (delta) =>
        set((state) => ({
          coinBalance: Math.max(0, state.coinBalance + Math.floor(delta)),
        })),
      setBattleAvailable: (battleAvailable) => set({ battleAvailable }),
      setBattleStakeTier: (battleStakeTier) => set({ battleStakeTier }),
      setNearbyUsers: (nearbyUsers) => set({ nearbyUsers }),
      setFuelRuntime: (fuelRuntime) =>
        set((state) => ({
          fuelRuntime: { ...state.fuelRuntime, ...fuelRuntime },
        })),
      setFuelRecharge: (fuelRecharge) => set({ fuelRecharge }),
      setUsername: (username) => set({ username }),
      setAvatarId: (avatarId) => set({ avatarId }),

      clearSession: async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set(initialState);
      },

      hydrateTokens: async () => {
        if (!get().userId) return;
        const [accessToken, refreshToken] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        ]);
        set({ accessToken, refreshToken });
      },

      setTokensFromRefresh: async (accessToken, refreshToken) => {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken != null) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        }));
      },

      hasSession: () => !!get().accessToken,
    }),
    {
      name: USER_SESSION_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        avatarId: state.avatarId,
        username: state.username,
        email: state.email,
        expiresIn: state.expiresIn,
        isGuest: state.isGuest,
        fuel: state.fuel,
        xp: state.xp,
        level: state.level,
        flagsOwned: state.flagsOwned,
        ownedAreaKm2: state.ownedAreaKm2,
        coinBalance: state.coinBalance,
        fuelRuntime: state.fuelRuntime,
        fuelRecharge: state.fuelRecharge,
      }),
      onRehydrateStorage: () => (_state, err) => {
        resolveRehydration?.();
      },
    }
  )
);
