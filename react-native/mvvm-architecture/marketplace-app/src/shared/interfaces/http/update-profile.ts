import { User } from '../user'

export interface UpdateProfileParams {
  name: string
  email: string
  phone: string
  password?: string
  newPassword?: string
}

export interface UpdateProfileResponse {
  user: User & {
    updatedAt: string
    deletedAt?: string
  }
}
