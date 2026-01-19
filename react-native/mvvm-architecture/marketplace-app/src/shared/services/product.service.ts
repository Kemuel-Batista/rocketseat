import { marketPlaceAPIClient } from '../api/marketplace'
import type { ProductRequest } from '../interfaces/http/product'
import { ProductResponse } from '../interfaces/http/product-response'
import type { ProductCategory } from '../interfaces/product'

export async function getProducts(params: ProductRequest) {
  const { data } = await marketPlaceAPIClient.post<ProductResponse>(
    '/products',
    params,
  )
  return data
}

export async function getProductsCategories() {
  const { data } = await marketPlaceAPIClient.get<ProductCategory[]>(
    '/products/categories',
  )
  return data
}
