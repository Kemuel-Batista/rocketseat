import { useEffect } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export const useNumberAnimation = (value: number | string) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.15, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    )
    opacity.value = withSequence(
      withTiming(0.7, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    )
  }, [opacity, scale, value])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return { animatedStyle }
}
