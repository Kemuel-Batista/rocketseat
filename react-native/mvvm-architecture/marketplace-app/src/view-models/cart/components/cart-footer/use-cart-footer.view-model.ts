import { useState } from 'react'
import { useCartStore } from '@/shared/store/cart-store'
import type { CreditCard } from '@/shared/interfaces/credit-card'
import { useSubmitOrderMutation } from '@/shared/queries/orders/use-submit-order.mutation'
import { router } from 'expo-router'
import { useAppModal } from '@/shared/hooks/use-app-modal'

export function useCartFooterViewModel() {
  const [selectedCreditCard, setSelectedCreditCard] =
    useState<null | CreditCard>(null)

  const { products, total, clearCart } = useCartStore()
  const { showSuccess } = useAppModal()

  const createOrderMutation = useSubmitOrderMutation()

  const submitOrderMutation = async () => {
    if (!selectedCreditCard) return

    await createOrderMutation.mutateAsync({
      creditCardId: selectedCreditCard.id,
      items: products.map(({ id, quantity }) => ({ productId: id, quantity })),
    })

    clearCart()
    showSuccess({
      title: 'Sucesso!',
      message: 'Pedido feito com sucesso!',
      buttonText: 'Ver pedidos',
      onButtonPress: () => {
        router.push('/orders')
      },
    })
  }

  return {
    total,
    selectedCreditCard,
    setSelectedCreditCard,
    submitOrderMutation,
    isLoadingOrder: createOrderMutation.isPending,
  }
}
