import { marketPlaceAPIClient } from '../api/marketplace'
import type {
  RegisterHttpParams,
  RegisterHttpResponse,
} from '../interfaces/http/register'

export async function register(userData: RegisterHttpParams) {
  const { data } = await marketPlaceAPIClient.post<RegisterHttpResponse>(
    '/auth/register',
    userData,
  )

  return data
}
