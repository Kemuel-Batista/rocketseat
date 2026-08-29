import { useAuthStore } from '@/shared/stores/auth.store'
import { router } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

export default function Home() {
  const { logout } = useAuthStore()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Home</Text>
      <TouchableOpacity
        onPress={() => {
          logout()
          router.replace('/(public)/login')
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}
