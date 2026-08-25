import { useBottomSheetStore } from '@/shared/store/bottom-sheet-store'
import { useCartStore } from '@/shared/store/cart-store'
import { createElement } from 'react'
import { AddCardBottomSheet } from './components/add-card-bottom-sheet'
import { useGetCreditCardsQuery } from '@/shared/queries/credit-cards/use-get-credit-cards.query'

export function useCartViewModel() {
  const { products } = useCartStore()

  const { open: openBottomSheet } = useBottomSheetStore()

  const { data: creditCards = [], isLoading: isLoadingCreditCards } =
    useGetCreditCardsQuery()

  const openCartBottomSheet = () => {
    openBottomSheet({ content: createElement(AddCardBottomSheet) })
  }

  return { products, openCartBottomSheet, creditCards, isLoadingCreditCards }
}
