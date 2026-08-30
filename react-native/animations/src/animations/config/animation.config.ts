import { Easing, WithSpringConfig } from 'react-native-reanimated'

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

export const ANIMATION_TIMINGS = {
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
}

export const ANIMATION_EASINGS = {
  entry: Easing.out(Easing.cubic),
}
