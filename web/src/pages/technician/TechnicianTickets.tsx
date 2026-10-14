import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CircleCheckBig, CircleHelp, Clock2 } from 'lucide-react'
import { useState } from 'react'
import { TicketCard } from '@/components/tickets/TicketCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCurrentUser } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { queryKeys } from '@/lib/queryKeys'
import type { TicketStatus } from '@/lib/types'
import { ticketsService } from '@/services'

const GROUPS: { status: TicketStatus; title: string; icon: typeof Clock2; tone: string }[] = [
  { status: 'in_progress', title: 'Em atendimento', icon: Clock2, tone: 'text-progress-ink' },
  { status: 'open', title: 'Abertos', icon: CircleHelp, tone: 'text-open-ink' },
  { status: 'closed', title: 'Encerrados', icon: CircleCheckBig, tone: 'text-done-ink' },
]

const PER_PAGE = 6

export function TechnicianTickets() {
  return (
    <>
      <PageHeader title="Meus chamados" />
      <div className="flex flex-col gap-8 md:gap-10">
        {GROUPS.map((group) => (
          <TicketGroup key={group.status} {...group} />
        ))}
      </div>
    </>
  )
}

function TicketGroup({ status, title, icon: Icon, tone }: (typeof GROUPS)[number]) {
  const user = useCurrentUser()
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: queryKeys.ticketList({ status, page, perPage: PER_PAGE }),
    queryFn: () => ticketsService.list({ status, page, perPage: PER_PAGE }),
    placeholderData: keepPreviousData,
  })
  const headingId = `grupo-${status}`

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className={cn('mb-3 flex items-center gap-2 text-sm font-bold', tone)}>
        <Icon className="size-4" aria-hidden />
        {title}
        {query.data && (
          <span className="tabular rounded-full bg-gray-500 px-2 text-xs text-gray-300">
            {query.data.meta.total}
          </span>
        )}
      </h2>

      {query.isPending ? (
        <div
          role="status"
          aria-label={`Carregando ${title.toLowerCase()}`}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg max-md:hidden" />
        </div>
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        status === 'in_progress' ? (
          <p className="rounded-lg border border-dashed border-gray-500 px-5 py-6 text-sm text-gray-300">
            Nenhum atendimento em andamento. Inicie um dos chamados abertos abaixo.
          </p>
        ) : status === 'open' ? (
          <EmptyState
            object="wrench"
            title="Fila zerada"
            description="Nenhum chamado aberto para você agora. Novos chamados chegam aqui automaticamente."
          />
        ) : (
          <p className="rounded-lg border border-dashed border-gray-500 px-5 py-6 text-sm text-gray-300">
            Os chamados que você encerrar ficam guardados aqui.
          </p>
        )
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.data.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} role={user.role} />
            ))}
          </div>
          <Pagination meta={query.data.meta} onChange={setPage} />
        </>
      )}
    </section>
  )
}
