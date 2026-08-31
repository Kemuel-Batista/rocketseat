import { Easing, WithSpringConfig } from 'react-native-reanimated'
import type { AnimationTimings } from '../interfaces/animation.interfaces'

export const SPRING_CONFIG = {
  press: {
    damping: 15,
    stiffness: 150,
  } as WithSpringConfig,

  entryThrow: {
    damping: 22,
    stiffness: 180,
  } as WithSpringConfig,

  entryDeck: {
    damping: 22,
    stiffness: 140,
  } as WithSpringConfig,

  entryScale: {
    damping: 22,
    stiffness: 180,
  } as WithSpringConfig,

  selection: {
    damping: 22,
    stiffness: 300,
  } as WithSpringConfig,

  modal: {
    damping: 25,
    stiffness: 120,
    mass: 1,
  } as WithSpringConfig,
}

export type CardEntryAnimationType = 'throw' | 'deck'

export const ENTRY_ANIMATION_START_POSITIONS = {
  throw: {
    x: 300,
    y: 600,
  },
  deck: {
    x: 0,
    y: 400,
  },
}

export const ANIMATION_TIMINGS: AnimationTimings = {
  entry: {
    throw: {
      duration: 400,
      delayBetweenCards: 50,
    },
    deck: {
      duration: 350,
      delayBetweenCards: 40,
    },
  },
  fall: {
    duration: 600,
    rotation: 300,
    opacityDuration: 200,
    opacityDelay: 400,
    maxRandomDelay: 200,
  },
}

export const ANIMATION_EASINGS = {
  entry: Easing.out(Easing.cubic),
}
