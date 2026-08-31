import { useEffect } from 'react'
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

interface UseListEntryAnimationProps {
  index: number
  delayPerItem?: number
}

export const useListEntryAnimation = ({
  index,
  delayPerItem = 150,
}: UseListEntryAnimationProps) => {
  const translateX = useSharedValue(index % 2 === 0 ? -60 : 60)
  const opacity = useSharedValue(0)

  useEffect(() => {
    const delay = index * delayPerItem

    translateX.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
    )

    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }))
  }, [index, delayPerItem, translateX, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))

  return { animatedStyle }
}
