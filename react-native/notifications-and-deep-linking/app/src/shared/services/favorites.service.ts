import { marketPlaceAPIClient } from '../api/marketplace'
import { Favorite, type AddFavoriteResponse } from '../interfaces/http/favorite'

export const getFavorites = async (): Promise<Favorite[]> => {
  const { data } = await marketPlaceAPIClient.get<Favorite[]>('/favorites')
  return data
}

export const addFavorite = async (productId: number) => {
  const { data } = await marketPlaceAPIClient.post<AddFavoriteResponse>(
    '/favorites',
    { productId },
  )
  return data
}

export const removeFavorite = async (productId: number) => {
  await marketPlaceAPIClient.delete(`/favorites/${productId}`)
}
