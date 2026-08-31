import { Dimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

interface UseSweepToDeleteProps {
  onDelete: () => void
}

const SCREEN_WIDTH = Dimensions.get('window').width
const DELETE_THRESHOLD = -100
const VELOCITY_THRESHOLD = -500

export const useSweepToDelete = ({ onDelete }: UseSweepToDeleteProps) => {
  const translateX = useSharedValue(0)
  const itemHeight = useSharedValue(60)
  const isDeleting = useSharedValue(false)

  const panGesture = Gesture.Pan()
    .activeOffsetX(-10)
    .onUpdate((event) => {
      if (isDeleting.value) return

      translateX.value = Math.min(0, event.translationX)
    })
    .onEnd((event) => {
      if (isDeleting.value) return

      const shouldDelete =
        event.translationX < DELETE_THRESHOLD ||
        event.velocityX < VELOCITY_THRESHOLD

      if (shouldDelete) {
        isDeleting.value = true
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 })
        itemHeight.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onDelete)()
          }
        })
      } else {
        translateX.value = withTiming(0, { duration: 200 })
      }
    })

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: isDeleting.value ? itemHeight.value : 'auto',
    overflow: 'visible' as const,

    opacity: interpolate(itemHeight.value, [0, 30], [0, 1]),
  }))

  const deleteIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, -40, 0], [1, 0.5, 0]),
  }))

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return {
    containerAnimatedStyle,
    deleteIconAnimatedStyle,
    cardAnimatedStyle,
    panGesture,
  }
}
