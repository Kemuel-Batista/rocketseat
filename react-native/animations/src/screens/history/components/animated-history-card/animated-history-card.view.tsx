import { useListEntryAnimation } from '@/animations/hooks/use-list-entry-animation'
import { useSweepToDelete } from '@/animations/hooks/use-sweep-to-detele'
import { colors } from '@/constants/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import type { FormattedMatch } from '../../use-history.view-model'
import { MatchHistoryCardView } from '../match-history-card/match-history-card.view'

interface AnimatedHistoryCardViewParams {
  match: FormattedMatch
  index: number
  onDelete: () => void
}

export function AnimatedHistoryCardView({
  match,
  index,
  onDelete,
}: AnimatedHistoryCardViewParams) {
  const { animatedStyle } = useListEntryAnimation({ index })

  const {
    panGesture,
    containerAnimatedStyle,
    deleteIconAnimatedStyle,
    cardAnimatedStyle,
  } = useSweepToDelete({ onDelete })

  return (
    <Animated.View style={[animatedStyle, containerAnimatedStyle]}>
      <Animated.View style={[deleteIconAnimatedStyle, styles.deleteBackground]}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={24}
          color={colors.semantic.error}
        />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle}>
          <MatchHistoryCardView match={match} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  deleteBackground: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
})
