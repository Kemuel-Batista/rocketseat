import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

/** Base URL da API (backend). Ex.: https://api.seudominio.com */
export const API_BASE_URL =
  extra.API_BASE_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://localhost:3333';

/** Chave usada nas rotas admin (sync da base de jogadores). Header: x-admin-token ou x-admin-api-key */
export const ADMIN_API_KEY =
  extra.ADMIN_API_KEY ?? process.env.EXPO_PUBLIC_ADMIN_API_KEY ?? '';

export const apiConfig = {
  baseUrl: API_BASE_URL.replace(/\/$/, ''),
  adminKey: ADMIN_API_KEY,
} as const;
