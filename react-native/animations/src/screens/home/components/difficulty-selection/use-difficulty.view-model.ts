import { Difficulty } from '@/shared/interfaces/difficulty'
import { useEffect, useState } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

export const useDifficultyViewModel = () => {
  const difficulties: Difficulty[] = ['Fácil', 'Médio', 'Difícil']

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('Fácil')

  const selectedIndex = difficulties.indexOf(selectedDifficulty)
  const translateX = useSharedValue(selectedIndex * 100)

  useEffect(() => {
    const newIndex = difficulties.indexOf(selectedDifficulty)
    translateX.value = withSpring(newIndex * 100, {
      damping: 30,
      stiffness: 120,
    })
  }, [selectedDifficulty, difficulties, translateX])

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }))

  return {
    difficulties,
    selectedDifficulty,
    setSelectedDifficulty,
    animatedIndicatorStyle,
  }
}
