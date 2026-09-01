import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

type GoogleExtraConfig = {
  GOOGLE_IOS_CLIENT_ID?: string;
  GOOGLE_ANDROID_CLIENT_ID?: string;
  GOOGLE_EXPO_CLIENT_ID?: string;
  GOOGLE_WEB_CLIENT_ID?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as GoogleExtraConfig;

const googleAuthConfig: Partial<Google.GoogleAuthRequestConfig> = {
  iosClientId: extra.GOOGLE_IOS_CLIENT_ID,
  androidClientId: extra.GOOGLE_ANDROID_CLIENT_ID,
  webClientId: extra.GOOGLE_WEB_CLIENT_ID,
};

export function useGoogleAuthRequest() {
  const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig);

  return {
    request,
    response,
    promptAsync,
  };
}

