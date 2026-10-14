import { useContext } from 'react'
import { AuthContext } from '@/contexts/auth-context'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return context
}

/** Usuário autenticado — só para telas que já estão atrás das rotas protegidas. */
export function useCurrentUser() {
  const { user } = useAuth()
  if (!user) throw new Error('Nenhum usuário autenticado.')
  return user
}
