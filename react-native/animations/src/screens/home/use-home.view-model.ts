import { Difficulty } from '@/shared/interfaces/difficulty'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'

export function useHomeViewModel() {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('Fácil')

  const handleSelectChallenge = useCallback(
    (themeId: string) => {
      router.push({
        pathname: '/(private)/game',
        params: {
          themeId,
          difficulty: selectedDifficulty,
        },
      })
    },
    [selectedDifficulty],
  )
  return {
    selectedDifficulty,
    setSelectedDifficulty,
    handleSelectChallenge,
  }
}
