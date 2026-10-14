import { Inbox, Wrench } from 'lucide-react'

type EmptyStateObjectProps = { kind: 'inbox' | 'wrench' }

/** Versão estática do objeto do estado vazio (a cena 3D entra na fase 6). */
export function EmptyStateObject({ kind }: EmptyStateObjectProps) {
  const Icon = kind === 'inbox' ? Inbox : Wrench
  return (
    <span className="flex size-24 items-center justify-center rounded-full bg-blue-light/15 text-blue-dark">
      <Icon className="size-10" strokeWidth={1.5} aria-hidden />
    </span>
  )
}
