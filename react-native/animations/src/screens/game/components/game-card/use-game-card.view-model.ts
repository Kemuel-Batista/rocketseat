import { useCardEntryAnimation } from '@/animations/hooks/use-card-entry-animation'
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
  index: number
}

export function useGameCardViewModel({ card, index }: Props) {
  const rotation = useSharedValue(card.isFlipped ? 180 : 0)

  const { selectCard } = useGameStore()

  const entry = useCardEntryAnimation({ cardIndex: index })

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

  return { card, backAnimatedStyle, frontAnimatedStyle, selectCard, entry }
}
