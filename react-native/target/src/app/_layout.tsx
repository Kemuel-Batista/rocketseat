import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter'
import { Stack } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { Suspense } from 'react'

import { Loading } from '@/components/loading'
import { migrate } from '@/database/migrate'
import { colors } from '@/theme/colors'

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  })

  if (!fontsLoaded) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName="target.db" onInit={migrate} useSuspense>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.white },
          }}
        />
      </SQLiteProvider>
    </Suspense>
  )
}
