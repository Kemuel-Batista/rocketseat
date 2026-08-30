import { create } from 'zustand'
import type { CardEntryAnimationType } from '../config/animation.config'

interface AnimationStore {
  entryAnimationType: CardEntryAnimationType
  isAnimating: boolean
  setEntryAnimationType: (type: CardEntryAnimationType) => void
  setIsAnimating: (isAnimating: boolean) => void
}

export const useAnimationStore = create<AnimationStore>()((set) => ({
  entryAnimationType: 'throw',
  isAnimating: false,
  setEntryAnimationType: (entryAnimationType) => set({ entryAnimationType }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
}))
