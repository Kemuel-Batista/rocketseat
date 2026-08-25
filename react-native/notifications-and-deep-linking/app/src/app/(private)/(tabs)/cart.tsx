import { CartView } from '@/view-models/cart/cart.view'
import { useCartViewModel } from '@/view-models/cart/use-cart.view-model'

export default function Cart() {
  const viewModel = useCartViewModel()

  return <CartView {...viewModel} />
}
