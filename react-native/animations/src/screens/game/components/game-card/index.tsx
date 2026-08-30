import type { StoreCard } from '@/shared/utils/challenge'
import { GameCardView } from './game-card.view'
import { useGameCardViewModel } from './use-game-card.view-model'

interface GameCardProps {
  card: StoreCard
  index: number
}

export function GameCard({ card }: GameCardProps) {
  const viewModel = useGameCardViewModel({ card })

  return <GameCardView {...viewModel} />
}
