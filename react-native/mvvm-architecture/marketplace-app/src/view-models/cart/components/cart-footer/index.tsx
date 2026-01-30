import { CreditCard } from '@/shared/interfaces/credit-card'
import { useCartFooterViewModel } from './use-cart-footer.view-model'
import { CartFooterView } from './cart-footer.view'

export interface CartFooterProps {
  openCartBottomSheet: () => void
  creditCards: CreditCard[]
  isLoadingCreditCards: boolean
}

export function CartFooter({
  openCartBottomSheet,
  creditCards,
  isLoadingCreditCards,
}: CartFooterProps) {
  const viewModel = useCartFooterViewModel()

  return (
    <CartFooterView
      {...viewModel}
      openCartBottomSheet={openCartBottomSheet}
      creditCards={creditCards}
      isLoadingCreditCards={isLoadingCreditCards}
    />
  )
}
