import { post, get } from './client'
import { auth } from './auth'

export const api = {
  post,
  get,
  auth,
}

export type { ApiResponse } from './client'
export type { AuthUser } from './auth'
