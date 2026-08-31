import { CardEntryAnimationType } from '../config/animation.config'

export interface AnimationTimings {
  entry: Record<
    CardEntryAnimationType,
    {
      duration: number
      delayBetweenCards: number
    }
  >
  fall: {
    duration: number
    rotation: number
    opacityDuration: number
    opacityDelay: number
    maxRandomDelay: number
  }
}
