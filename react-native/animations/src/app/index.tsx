import { router } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  return (
    <SafeAreaView>
      <Text>Index</Text>

      <TouchableOpacity onPress={() => router.push('/game')}>
        <Text>Game</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
