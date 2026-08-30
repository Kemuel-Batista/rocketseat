import type { CardEntryAnimationType } from '@/animations/config/animation.config'
import { useAnimationStore } from '@/animations/store/animation.store'
import { getEntryAnimationDuration } from '@/animations/utils/animation.utils'
import { Difficulty } from '@/shared/interfaces/difficulty'
import { useGameStore } from '@/shared/stores/game.store'
import { challengeTheme, difficultyConfigs } from '@/shared/utils/challenge'
import { createSequence } from '@/shared/utils/sequence.util'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

export const useGameViewModel = () => {
  const { themeId, difficulty } = useLocalSearchParams<{
    themeId: string
    difficulty: Difficulty
  }>()

  const { initGame, status, previewAllCards, hideAllCards, startGame, cards } =
    useGameStore()

  const { entryAnimationType, setShouldAnimate, setEntryAnimationType } =
    useAnimationStore()

  const [countdownVisible, setCountdownVisible] = useState(
    status === 'countdown',
  )

  const selectedTheme = challengeTheme.find((theme) => theme.id === themeId)

  const handleCountdownComplete = useCallback(() => {
    setCountdownVisible(false)
    setShouldAnimate(true)

    const totalAnimationTime = getEntryAnimationDuration(
      cards.length,
      entryAnimationType,
    )

    createSequence()
      .wait(totalAnimationTime)
      .then(previewAllCards)
      .wait(2000)
      .then(hideAllCards)
      .wait(300)
      .then(startGame)
      .run()
  }, [
    cards.length,
    entryAnimationType,
    previewAllCards,
    hideAllCards,
    startGame,
    setShouldAnimate,
  ])

  useEffect(() => {
    const theme = challengeTheme.find(({ id }) => id === themeId)

    if (theme && difficulty) {
      setShouldAnimate(false)
      const animationTypes: CardEntryAnimationType[] = ['deck', 'throw']

      const randomEntryType =
        animationTypes[Math.floor(Math.random() * animationTypes.length)]

      setEntryAnimationType(randomEntryType)

      initGame({
        id: `${themeId}-${difficulty}`,
        title: selectedTheme?.title || '',
        cards: selectedTheme?.cards || [],
        difficulty,
        estimatedTime: difficultyConfigs[difficulty].estimatedTime,
        timeLimit: difficultyConfigs[difficulty].timeLimit,
      })

      createSequence()
        .wait(500)
        .then(() => {
          setCountdownVisible(true)
        })
        .run()
    }
  }, [
    difficulty,
    setEntryAnimationType,
    initGame,
    setShouldAnimate,
    selectedTheme?.cards,
    selectedTheme?.title,
    themeId,
  ])

  const handleGoBack = () => {
    router.back()
  }

  return {
    selectedTheme,
    countdownVisible,
    handleCountdownComplete,
    handleGoBack,
  }
}
