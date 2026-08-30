import { useEffect } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  ANIMATION_TIMINGS,
  ENTRY_ANIMATION_START_POSITIONS,
  SPRING_CONFIG,
} from '../config/animation.config'
import { useAnimationStore } from '../store/animation.store'

interface UseCardEntryAnimationProps {
  cardIndex: number
}

export const useCardEntryAnimation = ({
  cardIndex,
}: UseCardEntryAnimationProps) => {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1.2)
  const rotation = useSharedValue(0)

  const { entryAnimationType, shouldAnimate } = useAnimationStore()

  useEffect(() => {
    if (shouldAnimate) {
      const config = ANIMATION_TIMINGS.entry[entryAnimationType]
      const delay = cardIndex * config.delayBetweenCards

      if (entryAnimationType === 'throw') {
        translateX.value = ENTRY_ANIMATION_START_POSITIONS.throw.x
        translateY.value = ENTRY_ANIMATION_START_POSITIONS.throw.y
        rotation.value = -30

        translateX.value = withDelay(
          delay,
          withSpring(0, SPRING_CONFIG.entryThrow),
        )
        translateY.value = withDelay(
          delay,
          withSpring(0, SPRING_CONFIG.entryDeck),
        )
        rotation.value = withDelay(
          delay,
          withSpring(0, SPRING_CONFIG.entryDeck),
        )
      }

      if (entryAnimationType === 'deck') {
        translateX.value = ENTRY_ANIMATION_START_POSITIONS.deck.x
        translateY.value = ENTRY_ANIMATION_START_POSITIONS.deck.y

        translateX.value = withDelay(
          delay,
          withTiming(0, SPRING_CONFIG.entryDeck),
        )
        translateY.value = withDelay(
          delay,
          withTiming(0, SPRING_CONFIG.entryDeck),
        )
      }

      opacity.value = withDelay(delay, withTiming(1, { duration: 150 }))
      scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG.entryScale))
    }
  }, [
    cardIndex,
    entryAnimationType,
    shouldAnimate,
    translateX,
    translateY,
    rotation,
    opacity,
    scale,
  ])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }))

  return { animatedStyle }
}
