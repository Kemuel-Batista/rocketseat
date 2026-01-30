import { useState } from 'react'
import { useCartStore } from '@/shared/store/cart-store'
import type { CreditCard } from '@/shared/interfaces/credit-card'

export function useCartFooterViewModel() {
  const [selectedCreditCard, setSelectedCreditCard] =
    useState<null | CreditCard>(null)

  const { total } = useCartStore()

  return {
    total,
    selectedCreditCard,
    setSelectedCreditCard,
  }
}
