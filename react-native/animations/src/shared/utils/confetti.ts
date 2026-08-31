import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const CONFETTI_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#A8D8EA',
  '#55EAE1',
  '#7DAFFF',
  '#C27CFB',
  '#32D74B',
]

export type ConfettiShapeType = 'square' | 'rectangle' | 'circle'

export const SHAPES: ConfettiShapeType[] = ['circle', 'square', 'rectangle']

export interface ConfettiConfig {
  id: number
  color: string
  startX: number
  delay: number
  duration: number
  shape: ConfettiShapeType
  swingDirection: number
  swingAmount: number
  rotationSpeed: number
  createdAt: number
  size: number
}

export const createConfettiPiece = (
  id: number,
  isBurst: boolean,
): ConfettiConfig => {
  const swingDirection = id % 2 === 0 ? 1 : -1

  return {
    id,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    startX: Math.random() * SCREEN_WIDTH,
    delay: isBurst ? Math.random() * 400 : 0,
    duration: isBurst
      ? 3500 + Math.random() * 1000
      : 4500 + Math.random() * 1500,
    size: 8 + Math.random() * 6,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    swingDirection,
    swingAmount: 25 + Math.random() * 35,
    rotationSpeed: 2 + Math.random() * 2,
    createdAt: Date.now(),
  }
}
