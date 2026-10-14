import { useQueries } from '@tanstack/react-query'
import { CircleCheckBig, CircleHelp, Clock2 } from 'lucide-react'
import { TiltCard } from '@/components/three/TiltCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { queryKeys } from '@/lib/queryKeys'
import type { TicketStatus } from '@/lib/types'
import { ticketsService } from '@/services'

const LABELS: Record<TicketStatus, string> = {
  open: 'Abertos',
  in_progress: 'Em atendimento',
  closed: 'Encerrados',
}

const STATUSES: { status: TicketStatus; icon: typeof CircleHelp; tone: string; ring: string }[] = [
  { status: 'open', icon: CircleHelp, tone: 'text-open-ink bg-open/12', ring: 'ring-open' },
  {
    status: 'in_progress',
    icon: Clock2,
    tone: 'text-progress-ink bg-progress/12',
    ring: 'ring-progress',
  },
  { status: 'closed', icon: CircleCheckBig, tone: 'text-done-ink bg-done/12', ring: 'ring-done' },
]

type StatusMetricCardsProps = {
  selected?: TicketStatus
  onSelect: (status: TicketStatus | undefined) => void
}

/**
 * Totais por status (admin). Cada card também é o filtro da tabela abaixo:
 * clicar de novo no card ativo limpa o filtro.
 */
export function StatusMetricCards({ selected, onSelect }: StatusMetricCardsProps) {
  const counts = useQueries({
    queries: STATUSES.map(({ status }) => ({
      queryKey: queryKeys.ticketCount(status),
      queryFn: () => ticketsService.list({ status, perPage: 1 }).then((r) => r.meta.total),
    })),
  })

  return (
    <div role="group" aria-label="Filtrar por status" className="grid grid-cols-3 gap-2 md:gap-4">
      {STATUSES.map(({ status, icon: Icon, tone, ring }, index) => {
        const count = counts[index]
        const active = selected === status
        return (
          <TiltCard key={status}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? undefined : status)}
              className={cn(
                'flex h-full w-full flex-col gap-3 rounded-lg border bg-gray-600 p-3 text-left transition-[border-color,box-shadow] duration-200 md:flex-row md:items-center md:gap-4 md:p-5',
                active
                  ? cn('border-transparent ring-2', ring)
                  : 'border-gray-500 hover:border-gray-400',
              )}
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full md:size-11',
                  tone,
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col">
                {count?.isPending ? (
                  <Skeleton className="my-1 h-6 w-8" />
                ) : (
                  <span className="tabular text-xl leading-tight font-bold text-gray-200">
                    {count?.data ?? '–'}
                  </span>
                )}
                <span className="text-xs text-gray-300">{LABELS[status]}</span>
              </span>
            </button>
          </TiltCard>
        )
      })}
    </div>
  )
}
