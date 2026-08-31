import { create } from 'zustand'
import type { CardEntryAnimationType } from '../config/animation.config'

interface AnimationStore {
  entryAnimationType: CardEntryAnimationType
  isAnimating: boolean
  shouldAnimate: boolean
  setShouldAnimate: (value: boolean) => void
  setEntryAnimationType: (type: CardEntryAnimationType) => void
  setIsAnimating: (isAnimating: boolean) => void
}

export const useAnimationStore = create<AnimationStore>()((set) => ({
  entryAnimationType: 'throw',
  isAnimating: false,
  shouldAnimate: false,
  setShouldAnimate: (value) => set({ shouldAnimate: value }),
  setEntryAnimationType: (entryAnimationType) => set({ entryAnimationType }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
}))
