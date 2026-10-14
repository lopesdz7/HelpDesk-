import { Inbox, Wrench } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useCan3D } from '@/hooks/useCan3D'
import { SceneErrorBoundary } from './SceneErrorBoundary'

const EmptyStateScene = lazy(() => import('./EmptyStateScene'))

type EmptyStateObjectProps = { kind: 'inbox' | 'wrench' }

/**
 * Objeto do estado vazio: pequeno e girando devagar em 3D quando possível;
 * ícone estático em mobile, reduced-motion ou GPU fraca (e enquanto a cena carrega).
 */
export function EmptyStateObject({ kind }: EmptyStateObjectProps) {
  const can3D = useCan3D()
  const fallback = <StaticObject kind={kind} />

  if (!can3D) return fallback

  return (
    <span aria-hidden className="block size-28">
      <SceneErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <EmptyStateScene kind={kind} />
        </Suspense>
      </SceneErrorBoundary>
    </span>
  )
}

function StaticObject({ kind }: EmptyStateObjectProps) {
  const Icon = kind === 'inbox' ? Inbox : Wrench
  return (
    <span aria-hidden className="flex size-28 items-center justify-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-blue-light/15 text-blue-dark">
        <Icon className="size-9" strokeWidth={1.5} />
      </span>
    </span>
  )
}
