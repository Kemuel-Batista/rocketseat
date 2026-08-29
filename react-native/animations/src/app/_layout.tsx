import { Baloo2_400Regular } from '@expo-google-fonts/baloo-2/400Regular'
import { Baloo2_500Medium } from '@expo-google-fonts/baloo-2/500Medium'
import { Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2/600SemiBold'
import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2/700Bold'
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import 'react-native-reanimated'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  })

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(private)" />
      <Stack.Screen name="index" />
    </Stack>
  )
}
