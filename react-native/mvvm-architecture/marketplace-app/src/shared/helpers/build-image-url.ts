import Constants from 'expo-constants'
import { Platform } from 'react-native'

export const buildImageUrl = (originalUrl: string) => {
  if (Constants.expoConfig?.extra?.isProduction) {
    return originalUrl
  }

  return Platform.select({
    android: originalUrl.replace('localhost', '10.0.2.2'),
    ios: originalUrl.replace(
      'http://localhost:3001',
      'https://eb773203d351.ngrok-free.app',
    ),
  })
}
