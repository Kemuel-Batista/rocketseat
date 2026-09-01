import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

/**
 * URL base do Colyseus. Mesmo host da API; se a API está em :3000, Colyseus em :3001.
 * O cliente faz POST para {wsUrl}/matchmake/joinOrCreate e WebSocket no mesmo host.
 * Ex.: EXPO_PUBLIC_COLYSEUS_WS_URL=http://164.68.114.223:3001
 * Após mudar o .env: npx expo start --clear
 */
const COLYSEUS_WS_URL =
  extra.COLYSEUS_WS_URL ??
  process.env.EXPO_PUBLIC_COLYSEUS_WS_URL ??
  'http://localhost:3001';

export const colyseusConfig = {
  wsUrl: COLYSEUS_WS_URL.replace(/\/$/, ''),
} as const;
