import { useGameStore } from '@/shared/stores/game.store'
import type { StoreCard } from '@/shared/utils/challenge'
import { useEffect } from 'react'
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

interface Props {
  card: StoreCard
}

export function useGameCardViewModel({ card }: Props) {
  const rotation = useSharedValue(card.isFlipped ? 180 : 0)

  const { selectCard } = useGameStore()

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` },
    ],
  }))

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` },
    ],
  }))

  useEffect(() => {
    rotation.value = withSpring(card.isFlipped ? 180 : 0, { duration: 300 })
  }, [card.isFlipped, rotation])

  return { card, backAnimatedStyle, frontAnimatedStyle, selectCard }
}
