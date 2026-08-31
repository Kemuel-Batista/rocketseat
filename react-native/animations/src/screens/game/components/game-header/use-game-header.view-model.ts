import { useGameStore } from '@/shared/stores/game.store'
import { useEffect } from 'react'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

export function useGameHeaderViewModel() {
  const { timeRemaining } = useGameStore()

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const scale = useSharedValue(1)

  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const isCriticalTime = timeRemaining <= 20

  useEffect(() => {
    if (isCriticalTime) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 300,
          }),
          withTiming(1, {
            duration: 300,
          }),
        ),
        -1,
        true,
      )
    } else {
      cancelAnimation(scale)
    }
  }, [isCriticalTime, scale, timeRemaining])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return {
    timeString,
    isCriticalTime,
    animatedStyle,
  }
}
