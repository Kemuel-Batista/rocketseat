import { CardEntryAnimationType } from '../config/animation.config'

export interface AnimationTimings {
  entry: Record<
    CardEntryAnimationType,
    {
      duration: number
      delayBetweenCards: number
    }
  >
}
