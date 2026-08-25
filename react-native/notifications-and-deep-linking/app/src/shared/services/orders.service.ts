import { marketPlaceAPIClient } from '../api/marketplace'
import type { GetOrdersResponse } from '../interfaces/http/get-orders'
import type {
  SubmitOrderRequestParamsInterface,
  SubmitOrderResponse,
} from '../interfaces/http/submit-orders'

export async function submitOrder(order: SubmitOrderRequestParamsInterface) {
  const { data } = await marketPlaceAPIClient.post<SubmitOrderResponse>(
    '/orders',
    order,
  )

  return data
}

export async function getOrders() {
  const { data } = await marketPlaceAPIClient.get<GetOrdersResponse>('/orders')

  return data
}
