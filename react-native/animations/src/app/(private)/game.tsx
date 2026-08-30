import type { Difficulty } from '@/shared/interfaces/difficulty'
import { useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Game() {
  const params = useLocalSearchParams<{
    themeId: string
    difficulty: Difficulty
  }>()

  console.log(params)

  return (
    <SafeAreaView>
      <Text>Game</Text>
    </SafeAreaView>
  )
}
