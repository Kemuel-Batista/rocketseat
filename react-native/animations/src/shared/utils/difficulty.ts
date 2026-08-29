import { colors } from '@/constants/colors'
import { Difficulty } from '../interfaces/difficulty'

const difficultyColors: Record<Difficulty, string> = {
  Fácil: colors.semantic.success,
  Médio: colors.semantic.warning,
  Difícil: colors.semantic.error,
}

export const getDifficultyColor = (difficulty: Difficulty) => {
  return difficultyColors[difficulty]
}
