import { format } from 'date-fns'
import type { CreditCard } from '@/shared/interfaces/credit-card'

export function useCreditCardItemViewModel(creditCard: CreditCard) {
  const formattedExpirationDate = format(creditCard.expirationDate, 'MM/yyyy')

  const formattedCardNumber = creditCard.number.slice(-4)

  return {
    creditCard,
    formattedExpirationDate,
    formattedCardNumber,
  }
}
