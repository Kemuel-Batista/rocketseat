import { marketPlaceAPIClient } from '../api/marketplace'
import type { AuthResponse } from '../interfaces/http/auth-response'
import type { LoginHttpParams } from '../interfaces/http/login'
import type { RegisterHttpParams } from '../interfaces/http/register'

export async function register(userData: RegisterHttpParams) {
  const { data } = await marketPlaceAPIClient.post<AuthResponse>(
    '/auth/register',
    userData,
  )

  return data
}

export async function login(userData: LoginHttpParams) {
  const { data } = await marketPlaceAPIClient.post<AuthResponse>(
    '/auth/login',
    userData,
  )

  return data
}
