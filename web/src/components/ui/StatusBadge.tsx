import { CircleCheckBig, CircleHelp, Clock2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { STATUS_LABEL } from '@/lib/format'
import type { TicketStatus } from '@/lib/types'

const styles: Record<TicketStatus, string> = {
  open: 'bg-open/12 text-open-ink',
  in_progress: 'bg-progress/12 text-progress-ink',
  closed: 'bg-done/12 text-done-ink',
}

const icons: Record<TicketStatus, typeof CircleHelp> = {
  open: CircleHelp,
  in_progress: Clock2,
  closed: CircleCheckBig,
}

type StatusBadgeProps = {
  status: TicketStatus
  /** "compact" esconde o texto abaixo de md (o ícone segue distinto por status e o texto fica para leitores de tela). */
  compact?: boolean
  className?: string
}

/**
 * Badge de status com ícone + texto. Quando o status muda, o badge faz um flip 3D em CSS
 * (só na mudança, não no primeiro render; desligado em reduced-motion).
 */
export function StatusBadge({ status, compact = false, className }: StatusBadgeProps) {
  const [previous, setPrevious] = useState(status)
  const [flips, setFlips] = useState(0)

  // Estado derivado durante o render: conta as trocas de status.
  if (status !== previous) {
    setPrevious(status)
    setFlips((count) => count + 1)
  }

  const Icon = icons[status]
  return (
    <span
      key={flips}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2 text-xs font-bold whitespace-nowrap [transform-origin:center_top]',
        flips > 0 && 'motion-safe:animate-status-flip',
        compact && 'max-md:w-7 max-md:justify-center max-md:px-0',
        styles[status],
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
      <span className={cn(compact && 'max-md:sr-only')}>{STATUS_LABEL[status]}</span>
    </span>
  )
}
