import { marketPlaceAPIClient } from '../api/marketplace'
import type {
  SubmitOrderRequestParamsInterface,
  SubmitOrderResponse,
} from '../interfaces/http/orders'

export async function submitOrder(order: SubmitOrderRequestParamsInterface) {
  const { data } = await marketPlaceAPIClient.post<SubmitOrderResponse>(
    '/orders',
    order,
  )

  return data
}
