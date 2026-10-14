import { useQueries } from '@tanstack/react-query'
import { Check, CircleCheckBig, CircleHelp, Clock2, Layers } from 'lucide-react'
import { TiltCard } from '@/components/three/TiltCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { queryKeys } from '@/lib/queryKeys'
import type { TicketStatus } from '@/lib/types'
import { ticketsService } from '@/services'

type Option = {
  status?: TicketStatus
  label: string
  icon: typeof CircleHelp
  tone: string
  selected: string
}

const OPTIONS: Option[] = [
  {
    label: 'Todos',
    icon: Layers,
    tone: 'text-gray-200 bg-gray-500',
    selected: 'border-gray-200 bg-gray-500/40',
  },
  {
    status: 'open',
    label: 'Abertos',
    icon: CircleHelp,
    tone: 'text-open-ink bg-open/12',
    selected: 'border-open bg-open/6',
  },
  {
    status: 'in_progress',
    label: 'Em atendimento',
    icon: Clock2,
    tone: 'text-progress-ink bg-progress/12',
    selected: 'border-progress bg-progress/6',
  },
  {
    status: 'closed',
    label: 'Encerrados',
    icon: CircleCheckBig,
    tone: 'text-done-ink bg-done/12',
    selected: 'border-done bg-done/6',
  },
]

type StatusMetricCardsProps = {
  selected?: TicketStatus
  onSelect: (status: TicketStatus | undefined) => void
}

/**
 * Totais por status (admin) que também são o filtro da tabela logo abaixo.
 * Cada card inclina levemente no hover (TiltCard); o selecionado fica marcado.
 */
export function StatusMetricCards({ selected, onSelect }: StatusMetricCardsProps) {
  const counts = useQueries({
    queries: OPTIONS.map(({ status }) => ({
      queryKey: status ? queryKeys.ticketCount(status) : (['tickets', 'count', 'all'] as const),
      queryFn: () => ticketsService.list({ status, perPage: 1 }).then((r) => r.meta.total),
    })),
  })

  return (
    <fieldset>
      <legend className="field-label mb-2 text-gray-300">Filtrar por status</legend>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {OPTIONS.map((option, index) => {
          const count = counts[index]
          const active = selected === option.status
          const Icon = option.icon
          return (
            <TiltCard key={option.label}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(option.status)}
                className={cn(
                  'flex h-full w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors duration-200 md:p-4',
                  active ? option.selected : 'border-gray-500 bg-gray-600 hover:border-gray-400',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    option.tone,
                  )}
                >
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-x-2 max-md:flex-wrap">
                  {count?.isPending ? (
                    <Skeleton className="h-5 w-6" />
                  ) : (
                    <span className="tabular text-lg leading-none font-bold text-gray-200">
                      {count?.data ?? '–'}
                    </span>
                  )}
                  <span className="text-sm leading-tight text-gray-300 md:truncate">
                    {option.label}
                  </span>
                </span>
                {active && <Check className="size-4 shrink-0 text-gray-200" aria-hidden />}
              </button>
            </TiltCard>
          )
        })}
      </div>
    </fieldset>
  )
}
