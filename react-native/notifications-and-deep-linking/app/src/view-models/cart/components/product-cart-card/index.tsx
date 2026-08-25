import type { CartProduct } from '@/shared/store/cart-store'
import { useProductCartCardViewModel } from './use-product-cart-card.view-model'
import { ProductCartCardView } from './product-cart-card.view'

interface ProductCartCardProps {
  product: CartProduct
}

export function ProductCartCard({ product }: ProductCartCardProps) {
  const viewModel = useProductCartCardViewModel()

  return <ProductCartCardView product={product} {...viewModel} />
}
