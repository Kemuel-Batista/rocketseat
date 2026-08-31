import { useListEntryAnimation } from '@/animations/hooks/use-list-entry-animation'
import Animated from 'react-native-reanimated'
import type { FormattedMatch } from '../../use-history.view-model'
import { MatchHistoryCardView } from '../match-history-card/match-history-card.view'

interface AnimatedHistoryCardViewParams {
  match: FormattedMatch
  index: number
}

export function AnimatedHistoryCardView({
  match,
  index,
}: AnimatedHistoryCardViewParams) {
  const { animatedStyle } = useListEntryAnimation({ index })
  return (
    <Animated.View style={[animatedStyle]}>
      <MatchHistoryCardView match={match} />
    </Animated.View>
  )
}
