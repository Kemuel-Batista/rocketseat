import { marketPlaceAPIClient } from '../api/marketplace'
import { CreditCard } from '../interfaces/credit-card'
import type {
  CreateCreditCardRequestParams,
  CreateCreditCardResponse,
} from '../interfaces/http/create-credit-card'

export async function getCreditCards() {
  const { data } = await marketPlaceAPIClient.get<CreditCard>('/credit-cards')

  return data
}

export async function createCreditCard(
  creditCardData: CreateCreditCardRequestParams,
) {
  const { data } = await marketPlaceAPIClient.post<CreateCreditCardResponse>(
    '/credit-cards',
    creditCardData,
  )
  return data
}
