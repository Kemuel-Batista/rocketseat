import type { ProductInterface } from '@/shared/interfaces/product'
import { useProductCardViewModel } from './use-product-card.view-model'
import { ProductCardView } from './product-card.view'

interface ProductCardProps {
  product: ProductInterface
}

export function ProductCard(props: ProductCardProps) {
  const viewModel = useProductCardViewModel(props)

  return <ProductCardView {...viewModel} />
}
