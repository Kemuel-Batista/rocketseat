import { marketPlaceAPIClient } from '../api/marketplace'
import type {
  CreateCommentRequest,
  CreateCommentResponse,
} from '../interfaces/http/create-comment'
import type { PaginatedResponse } from '../interfaces/http/paginated-response'
import type { ProductRequest } from '../interfaces/http/product'
import type { GetProductCommentsInterface } from '../interfaces/http/product-comments'
import type { GetProductDetailInterface } from '../interfaces/http/product-detail'
import type {
  UpdateCommentRequest,
  UpdateCommentResponse,
} from '../interfaces/http/update-comment'
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

export async function createComment(params: CreateCommentRequest) {
  const { data } = await marketPlaceAPIClient.post<CreateCommentResponse>(
    '/products/create/comments',
    params,
  )

  return data
}

export async function getUserComment(productId: number) {
  const { data } = await marketPlaceAPIClient.get<{
    content: string
    rating: number
  }>(`/products/${productId}/user-comment`)

  return data
}

export async function updateUserComment(params: UpdateCommentRequest) {
  const { data } = await marketPlaceAPIClient.put<UpdateCommentResponse>(
    `/products/comments/${params.commentId}`,
    {
      content: params.content,
      rating: params.rating,
    },
  )

  return data
}
