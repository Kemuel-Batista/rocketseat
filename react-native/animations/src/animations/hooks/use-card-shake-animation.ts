import { useCallback } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export const useCardShakeAnimation = () => {
  const translateX = useSharedValue(0)
  const rotation = useSharedValue(0)

  const onShake = useCallback(() => {
    translateX.value = withSequence(
      withTiming(10, { duration: 50 }),
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
        ),
        3,
        false,
      ),
      withTiming(0, { duration: 50 }),
    )

    rotation.value = withSequence(
      withTiming(5, { duration: 50 }),
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 50 }),
          withTiming(5, { duration: 50 }),
        ),
        3,
        false,
      ),
      withTiming(0, { duration: 50 }),
    )
  }, [translateX, rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }))

  return {
    animatedStyle,
    onShake,
  }
}
