import { marketPlaceAPIClient } from '../api/marketplace'
import type { PaginatedResponse } from '../interfaces/http/paginated-response'
import type { ProductRequest } from '../interfaces/http/product'
import type { GetProductCommentsInterface } from '../interfaces/http/product-comments'
import type { GetProductDetailInterface } from '../interfaces/http/product-detail'
import type { ProductCategory, ProductInterface } from '../interfaces/product'
import type { ProductComment } from '../interfaces/product-comment'

export async function getProducts(params: ProductRequest) {
  const { data } = await marketPlaceAPIClient.post<
    PaginatedResponse<ProductInterface>
  >('/products', params)

  return data
}

export async function getProductsCategories() {
  const { data } = await marketPlaceAPIClient.get<ProductCategory[]>(
    '/products/categories',
  )
  return data
}

export async function getProductDetails(id: number) {
  const { data } = await marketPlaceAPIClient.get<GetProductDetailInterface>(
    `/products/${id}`,
  )

  return data
}

export async function getProductComments(params: GetProductCommentsInterface) {
  const { data } = await marketPlaceAPIClient.post<
    PaginatedResponse<ProductComment>
  >('/products/comments', params)

  return data
}
