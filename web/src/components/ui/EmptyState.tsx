import type { ReactNode } from 'react'
import { EmptyStateObject } from '@/components/three/EmptyStateObject'

type EmptyStateProps = {
  title: string
  description: string
  action?: ReactNode
  /** Objeto 3D (ou o ícone estático equivalente) acima do texto. */
  object?: 'inbox' | 'wrench'
}

/** Ocupa o lugar de uma lista vazia — o 3D só aparece aqui, nunca junto de linhas. */
export function EmptyState({ title, description, action, object = 'inbox' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-500 px-6 py-12 text-center">
      <EmptyStateObject kind={object} />
      <div className="flex max-w-80 flex-col gap-1">
        <p className="text-md font-bold text-gray-200">{title}</p>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
      {action}
    </div>
  )
}
