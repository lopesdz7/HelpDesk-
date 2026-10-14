import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  readStorage,
  setUnauthorizedHandler,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  writeStorage,
} from '@/lib/api'
import type { SignInData } from '@/lib/schemas'
import { AuthContext } from './auth-context'
import type { User } from '@/lib/types'
import { authService } from '@/services'

function readStoredUser(): User | null {
  const token = readStorage(TOKEN_STORAGE_KEY)
  const raw = readStorage(USER_STORAGE_KEY)
  if (!token || !raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const queryClient = useQueryClient()

  const signOut = useCallback(() => {
    writeStorage(TOKEN_STORAGE_KEY, null)
    writeStorage(USER_STORAGE_KEY, null)
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  const signIn = useCallback(async (data: SignInData) => {
    const { token, user: signedUser } = await authService.signIn(data)
    writeStorage(TOKEN_STORAGE_KEY, token)
    writeStorage(USER_STORAGE_KEY, JSON.stringify(signedUser))
    setUser(signedUser)
    return signedUser
  }, [])

  const updateUser = useCallback((next: User) => {
    writeStorage(USER_STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  // O interceptor do axios desloga ao receber 401 (token expirado ou conta removida).
  useEffect(() => {
    setUnauthorizedHandler(signOut)
  }, [signOut])

  const value = useMemo(
    () => ({ user, signIn, signOut, updateUser }),
    [user, signIn, signOut, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
