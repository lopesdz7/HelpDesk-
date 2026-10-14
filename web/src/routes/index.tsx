import { lazy, Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AuthRoutes } from './AuthRoutes'

// Os painéis só são baixados depois do login: a tela de entrada carrega o mínimo.
const AdminRoutes = lazy(() => import('./AdminRoutes').then((m) => ({ default: m.AdminRoutes })))
const TechnicianRoutes = lazy(() =>
  import('./TechnicianRoutes').then((m) => ({ default: m.TechnicianRoutes })),
)
const ClientRoutes = lazy(() => import('./ClientRoutes').then((m) => ({ default: m.ClientRoutes })))

/** Cada papel tem sua própria árvore de rotas; sem sessão, só login e cadastro. */
function RoleRoutes() {
  const { user } = useAuth()
  if (!user) return <AuthRoutes />
  if (user.role === 'admin') return <AdminRoutes />
  if (user.role === 'technician') return <TechnicianRoutes />
  return <ClientRoutes />
}

function ShellFallback() {
  return (
    <div role="status" aria-label="Carregando" className="min-h-dvh bg-gray-100 md:pl-50">
      <div className="min-h-dvh rounded-t-xl bg-gray-600 md:mt-3 md:rounded-t-none md:rounded-tl-xl" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<ShellFallback />}>
        <RoleRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
