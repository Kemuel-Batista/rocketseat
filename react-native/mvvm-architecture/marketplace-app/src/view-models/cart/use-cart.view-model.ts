import { useBottomSheetStore } from '@/shared/store/bottom-sheet-store'
import { useCartStore } from '@/shared/store/cart-store'
import { createElement } from 'react'
import { AddCardBottomSheet } from './components/add-card-bottom-sheet'

export function useCartViewModel() {
  const { products } = useCartStore()

  const { open: openBottomSheet } = useBottomSheetStore()

  const openCartBottomSheet = () => {
    openBottomSheet({ content: createElement(AddCardBottomSheet) })
  }

  return { products, openCartBottomSheet }
}
