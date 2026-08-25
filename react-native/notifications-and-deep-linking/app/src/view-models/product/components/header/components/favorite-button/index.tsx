import { FavoriteButtonView } from './favorite-button.view'
import { useFavoriteButtonViewModel } from './favorite-button.view-model'

interface FavoriteButtonProps {
  productId: number
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
  const viewModel = useFavoriteButtonViewModel(productId)

  return <FavoriteButtonView {...viewModel} />
}
