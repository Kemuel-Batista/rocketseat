import { marketPlaceAPIClient } from '../api/marketplace'
import type {
  UpdateProfileParams,
  UpdateProfileResponse,
} from '../interfaces/http/update-profile'

export async function updateUserProfile(userData: UpdateProfileParams) {
  const { data } = await marketPlaceAPIClient.put<UpdateProfileResponse>(
    '/user',
    userData,
  )

  return data
}
