import { useCallback } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export const useCardSuccessAnimation = () => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const playSuccessAnimation = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 220 }),
      withTiming(1, { duration: 150 }),
    )
  }, [scale])

  const fadeOutSuccessAnimation = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 })
    scale.value = withTiming(0.8, { duration: 300 })
  }, [opacity, scale])

  const resetAnimation = useCallback(() => {
    scale.value = 1
    opacity.value = 1
  }, [opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return {
    animatedStyle,
    playSuccessAnimation,
    fadeOutSuccessAnimation,
    resetAnimation,
  }
}
