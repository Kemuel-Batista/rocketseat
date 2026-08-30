import { GameView } from '@/screens/game/game.view'
import type { Difficulty } from '@/shared/interfaces/difficulty'
import { useLocalSearchParams } from 'expo-router'

export default function Game() {
  const params = useLocalSearchParams<{
    themeId: string
    difficulty: Difficulty
  }>()

  return <GameView />
}
