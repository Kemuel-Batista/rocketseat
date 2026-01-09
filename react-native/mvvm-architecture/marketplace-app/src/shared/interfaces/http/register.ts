import type { User } from './user'

export interface RegisterHttpParams {
  name: string
  email: string
  avatarUrl?: string
  phone: string
  password: string
}

export interface RegisterHttpResponse {
  user: User
  token: string
  refreshToken: string
}
