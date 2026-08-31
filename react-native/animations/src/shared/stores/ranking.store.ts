import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Difficulty } from '../interfaces/difficulty'

export interface GameScore {
  id: string
  category: string
  difficulty: Difficulty
  date: Date
  time: number
}

interface RankingStore {
  scores: GameScore[]
  addScore: (score: Omit<GameScore, 'id' | 'date'>) => void
  deleteScore: (id: string) => void
}

const difficultyWeight: Record<Difficulty, number> = {
  Difícil: 3,
  Médio: 2,
  Fácil: 1,
}

export const useRankingStore = create<RankingStore>()(
  persist(
    (set) => ({
      scores: [],
      addScore: (game) => {
        const score: GameScore = {
          ...game,
          id: Date.now().toString(),
          date: new Date(),
        }

        set((state) => ({
          scores: [...state.scores, score].sort((a, b) => {
            const diffA = difficultyWeight[a.difficulty] || 0
            const diffB = difficultyWeight[b.difficulty]

            if (diffB !== diffA) return diffB - diffA

            return a.time - b.time
          }),
        }))
      },
      deleteScore: (id) => {
        set((state) => ({
          scores: state.scores.filter(({ id: scoreId }) => scoreId !== id),
        }))
      },
    }),
    {
      name: '@memory-game:scores',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
