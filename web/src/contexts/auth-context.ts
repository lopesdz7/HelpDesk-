import { createContext } from 'react'
import type { SignInData } from '@/lib/schemas'
import type { User } from '@/lib/types'

export type AuthContextValue = {
  user: User | null
  signIn: (data: SignInData) => Promise<User>
  signOut: () => void
  /** Atualiza o usuário em memória e no storage (após editar perfil/avatar). */
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
