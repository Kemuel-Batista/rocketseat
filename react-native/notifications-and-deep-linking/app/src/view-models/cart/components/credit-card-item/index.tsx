import { CreditCard } from '@/shared/interfaces/credit-card'
import { useCreditCardItemViewModel } from './use-credit-card-item.view-model'
import { CreditCardItemView } from './credit-card-item.view'
import React from 'react'

interface CreditCardItemProps {
  creditCard: CreditCard
  isSelected: boolean
  setSelectedCreditCard: (creditCard: CreditCard) => void
}

export function CreditCardItem({
  creditCard,
  isSelected,
  setSelectedCreditCard,
}: CreditCardItemProps) {
  const viewModel = useCreditCardItemViewModel(creditCard)

  return (
    <CreditCardItemView
      {...viewModel}
      isSelected={isSelected}
      setSelectedCreditCard={setSelectedCreditCard}
    />
  )
}
