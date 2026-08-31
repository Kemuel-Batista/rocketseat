import { useCallback } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { SPRING_CONFIG } from '../config/animation.config'
export const useCardSelectionAnimation = () => {
  const scale = useSharedValue(1)

  const onPressIn = useCallback(() => {
    scale.value = withSpring(1.05, SPRING_CONFIG.selection)
  }, [scale])

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG.selection)
  }, [scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  }
}
