'use client'

import React, { createContext, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { AuthUser } from '@/lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: AuthUser | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      const res = await api.auth.login(email, password)

      if (!res.ok) {
        setIsLoading(false)
        throw new Error(res.message)
      }

      setUser(res.data.user)
      setIsLoading(false)
      router.push('/dashboard')
    },
    [router],
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    await api.auth.logout()
    setUser(null)
    setIsLoading(false)
    router.push('/login')
  }, [router])

  const refresh = useCallback(async () => {
    const res = await api.auth.me()
    if (res.ok) {
      setUser(res.data.user || null)
    }
  }, [])

  return (
    <AuthContext value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext>
  )
}
