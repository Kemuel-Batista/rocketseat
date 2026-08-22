import { baseURL, marketPlaceAPIClient } from '../api/marketplace'
import type { AuthResponse } from '../interfaces/http/auth-response'
import type { LoginHttpParams } from '../interfaces/http/login'
import type { RegisterHttpParams } from '../interfaces/http/register'
import type { UploadAvatarResponse } from '../interfaces/http/upload-avatar'

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

export async function uploadAvatar(avatarUri: string) {
  const formData = new FormData()

  formData.append('avatar', {
    uri: avatarUri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  } as unknown as Blob)

  const { data } = await marketPlaceAPIClient.post<UploadAvatarResponse>(
    '/user/avatar',
    formData,
  )

  data.url = `${baseURL}${data.url}`

  return data
}
