import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

function isRewardedUnitId(value: unknown): value is string {
  return typeof value === 'string' && value.includes('/') && value.startsWith('ca-app-pub-');
}

/**
 * Em desenvolvimento usa sempre o ID de teste do AdMob.
 * Em release, defina em `expo.extra`:
 * - `adMobRewardedAdUnitIdIos` e `adMobRewardedAdUnitIdAndroid` (recomendado), ou
 * - `adMobRewardedAdUnitId` (único, usado nas duas plataformas).
 *
 * Nota: `androidAppId` / `iosAppId` no plugin são App IDs (com `~`), para o SDK — não servem como unit ID do rewarded (formato com `/`).
 */
export function getRewardedAdUnitId(): string | null {
  if (__DEV__) {
    return TestIds.REWARDED;
  }
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  if (!extra) return null;

  const perPlatform =
    Platform.OS === 'ios'
      ? extra.adMobRewardedAdUnitIdIos
      : Platform.OS === 'android'
        ? extra.adMobRewardedAdUnitIdAndroid
        : null;

  if (isRewardedUnitId(perPlatform)) {
    return perPlatform;
  }

  const fallback = extra.adMobRewardedAdUnitId;
  return isRewardedUnitId(fallback) ? fallback : null;
}
