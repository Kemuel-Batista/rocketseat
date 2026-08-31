import { useCardEntryAnimation } from '@/animations/hooks/use-card-entry-animation'
import { useCardShakeAnimation } from '@/animations/hooks/use-card-shake-animation'
import { useCardSuccessAnimation } from '@/animations/hooks/use-card-success-animation'
import { useCardTimeoutAnimation } from '@/animations/hooks/use-card-timeout-animation'
import { useGameStore } from '@/shared/stores/game.store'
import type { StoreCard } from '@/shared/utils/challenge'
import { useEffect, useRef } from 'react'
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

  const { selectCard, status } = useGameStore()

  const {
    animatedStyle: successAnimatedStyle,
    playSuccessAnimation,
    fadeOutSuccessAnimation,
    resetAnimation: resetCardSuccessAnimation,
  } = useCardSuccessAnimation()

  const {
    animatedStyle: timeoutAnimatedStyle,
    fallAnimation,
    resetAnimation: resetCardTimeoutAnimation,
  } = useCardTimeoutAnimation()

  const entry = useCardEntryAnimation({ cardIndex: index })

  const { animatedStyle: shakeAnimatedStyle, onShake } = useCardShakeAnimation()

  const previousFlippedRef = useRef(card.isFlipped)

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

  useEffect(() => {
    if (card.isFlipped === false && previousFlippedRef.current === true) {
      onShake()
    }
    previousFlippedRef.current = card.isFlipped
  }, [card.isFlipped, onShake, previousFlippedRef])

  useEffect(() => {
    if (card.isMatched) {
      playSuccessAnimation()

      setTimeout(() => {
        fadeOutSuccessAnimation()
      }, 600)
    }
  }, [card.isMatched, playSuccessAnimation, fadeOutSuccessAnimation])

  useEffect(() => {
    if (status === 'timeout' && !card.isMatched) {
      const randomDelay = Math.random() * 200
      fallAnimation(randomDelay)
    }

    if (status === 'countdown') {
      resetCardSuccessAnimation()
      resetCardTimeoutAnimation()
    }
  }, [
    status,
    card.isMatched,
    fallAnimation,
    resetCardSuccessAnimation,
    resetCardTimeoutAnimation,
  ])

  return {
    card,
    frontAnimatedStyle,
    backAnimatedStyle,
    selectCard,
    entry,
    shakeAnimatedStyle,
    successAnimatedStyle,
    timeoutAnimatedStyle,
  }
}
