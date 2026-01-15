import { useUserStore } from '@/shared/store/user-store'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function Home() {
  const { logout } = useUserStore()

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}
