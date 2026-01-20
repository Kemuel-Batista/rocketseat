export interface GetProductCommentsInterface {
  productId: number
  pagination: {
    page: number
    perPage: number
  }
}
