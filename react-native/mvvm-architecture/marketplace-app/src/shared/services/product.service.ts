import { marketPlaceAPIClient } from '../api/marketplace'
import type { ProductRequest } from '../interfaces/http/product'
import { ProductResponse } from '../interfaces/http/product-response'

export async function getProducts(params: ProductRequest) {
  const { data } = await marketPlaceAPIClient.post<ProductResponse>(
    '/products',
    params,
  )
  return data
}
