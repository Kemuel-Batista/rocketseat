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
      'https://9fee49af1f7f.ngrok-free.app',
    ),
  })
}
