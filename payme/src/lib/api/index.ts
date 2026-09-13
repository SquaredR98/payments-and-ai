import { post, get, patch } from './client'
import { auth } from './auth'

export const api = {
  post,
  get,
  patch,
  auth,
}

export type { ApiResponse } from './client'
export type { AuthUser } from './auth'
