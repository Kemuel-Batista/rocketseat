import type { FocusedField } from '../../use-add-card-bottom-sheet.view-model'
import { CreditCardView } from './credit-card.view'
import { useCreditCardViewModel } from './use-credit-card.view-model'

export interface CardData {
  number: string
  name: string
  expiry: string
  cvv: string
}

interface CreditCardProps {
  isFlipped: boolean
  focusedField: FocusedField | null
  cardData: CardData
}

export function CreditCard({
  isFlipped,
  focusedField,
  cardData,
}: CreditCardProps) {
  const viewModel = useCreditCardViewModel(isFlipped)

  return (
    <CreditCardView
      focusedField={focusedField}
      cardData={cardData}
      {...viewModel}
    />
  )
}
