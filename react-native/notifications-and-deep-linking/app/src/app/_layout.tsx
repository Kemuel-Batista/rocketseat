import React from 'react'
import { AppModal } from '@/shared/components/app-modal'
import '../styles/global.css'
import ToastManager from 'toastify-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(private)" />
        </Stack>
        <AppModal />
        <ToastManager useModal={false} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
