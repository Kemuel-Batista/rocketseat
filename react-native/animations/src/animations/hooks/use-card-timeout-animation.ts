import { useCallback } from 'react'
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

export const useCardTimeoutAnimation = () => {
  const translateY = useSharedValue(0)
  const rotation = useSharedValue(0)
  const opacity = useSharedValue(1)

  const fallAnimation = useCallback(
    (delay: number) => {
      const randomRotation = (Math.random() - 0.5) * 60

      translateY.value = withDelay(
        delay,
        withTiming(800, { duration: 600, easing: Easing.in(Easing.cubic) }),
      )

      rotation.value = withDelay(
        delay,
        withTiming(randomRotation, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        }),
      )

      opacity.value = withDelay(delay + 300, withTiming(0, { duration: 200 }))
    },
    [translateY, rotation, opacity],
  )

  const resetAnimation = useCallback(() => {
    translateY.value = 0
  }, [translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }))

  return { animatedStyle, fallAnimation, resetAnimation }
}
