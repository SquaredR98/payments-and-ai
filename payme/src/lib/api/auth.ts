import type { User } from '@/payload-types'
import { post, get } from './client'

export type AuthUser = Omit<
  User,
  'salt' | 'hash' | 'resetPasswordToken' | 'resetPasswordExpiration' | '_verificationToken'
>

export const auth = {
  login(email: string, password: string) {
    return post<{ user: AuthUser; token: string }>('/api/users/login', {
      email,
      password,
    })
  },

  register(data: { email: string; password: string; firstName: string; lastName: string }) {
    return post<{ doc: AuthUser }>('/api/users', data)
  },

  logout() {
    return post<{ message: string }>('/api/users/logout')
  },

  me() {
    return get<{ user: AuthUser | null }>('/api/users/me')
  },

  forgotPassword(email: string) {
    return post<{ message: string }>('/api/users/forgot-password', { email })
  },

  resetPassword(token: string, password: string) {
    return post<{ user: AuthUser; token: string }>('/api/users/reset-password', { token, password })
  },

  verifyEmail(token: string) {
    return post<{ message: string }>(`/api/users/verify/${token}`)
  },
}
