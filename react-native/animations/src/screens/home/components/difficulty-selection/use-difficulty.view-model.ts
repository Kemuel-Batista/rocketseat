import { useNumberAnimation } from '@/animations/hooks/use-number-animation'
import { Difficulty } from '@/shared/interfaces/difficulty'
import { difficultyConfigs } from '@/shared/utils/challenge'
import { useEffect, useState } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const difficulties: Difficulty[] = ['Fácil', 'Médio', 'Difícil']

export const useDifficultyViewModel = () => {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('Fácil')

  const difficultyConfig = difficultyConfigs[selectedDifficulty]

  const { animatedStyle: timeAnimatedStyle } = useNumberAnimation(
    difficultyConfig.estimatedTime,
  )

  const selectedIndex = difficulties.indexOf(selectedDifficulty)
  const translateX = useSharedValue(selectedIndex * 100)

  useEffect(() => {
    const newIndex = difficulties.indexOf(selectedDifficulty)
    translateX.value = withSpring(newIndex * 100, {
      damping: 30,
      stiffness: 120,
    })
  }, [selectedDifficulty, translateX])

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }))

  return {
    difficulties,
    selectedDifficulty,
    setSelectedDifficulty,
    animatedIndicatorStyle,
    timeAnimatedStyle,
    difficultyConfig,
  }
}
