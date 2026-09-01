import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

const getEnv = (key: string, fallback = ""): string => {
  const value = process.env[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "gorocketleague",
  slug: "gorocketleague",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: getEnv("APP_SCHEME", "com.gorocketleague"),
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  ios: {
    config: {
      googleMapsApiKey: getEnv("MAPS_API_KEY"),
    },
    usesAppleSignIn: true,
    supportsTablet: true,
    bundleIdentifier: getEnv("IOS_BUNDLE_IDENTIFIER", "com.gorocketleague"),
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
      CFBundleLocalizations: ["en", "pt-BR", "es"],
    },
    appleTeamId: getEnv("APPLE_TEAM_ID", ""),
  },
  android: {
    config: {
      googleMaps: {
        apiKey: getEnv("MAPS_API_KEY"),
      },
    },
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: getEnv("ANDROID_PACKAGE", "com.gorocketleague"),
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: getEnv("ADMOB_APP_ID_ANDROID"),
        iosAppId: getEnv("ADMOB_APP_ID_IOS"),
      },
    ],
    "expo-apple-authentication",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-localization",
      {
        supportedLocales: {
          ios: ["en", "pt-BR", "es"],
          android: ["en", "pt", "es"],
        },
      },
    ],
    "expo-sqlite",
    "expo-asset",
    "expo-secure-store",
    "expo-web-browser",
    "expo-audio",
    [
      "react-native-maps",
      {
        iosGoogleMapsApiKey: getEnv("MAPS_API_KEY"),
        androidGoogleMapsApiKey: getEnv("MAPS_API_KEY"),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    adMobRewardedAdUnitIdIos: getEnv("ADMOB_REWARDED_AD_UNIT_ID_IOS"),
    adMobRewardedAdUnitIdAndroid: getEnv("ADMOB_REWARDED_AD_UNIT_ID_ANDROID"),
    GOOGLE_IOS_CLIENT_ID: getEnv("GOOGLE_IOS_CLIENT_ID"),
    GOOGLE_ANDROID_CLIENT_ID: getEnv("GOOGLE_ANDROID_CLIENT_ID"),
    GOOGLE_EXPO_CLIENT_ID: getEnv("GOOGLE_EXPO_CLIENT_ID"),
  },
});
