import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { TicketTable } from '@/components/tickets/TicketTable'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryError } from '@/components/ui/QueryError'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { queryKeys } from '@/lib/queryKeys'
import { ticketsService } from '@/services'

export function ClientTickets() {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: queryKeys.ticketList({ page }),
    queryFn: () => ticketsService.list({ page }),
    placeholderData: keepPreviousData,
  })

  const hasTickets = (query.data?.meta.total ?? 0) > 0

  return (
    <>
      <PageHeader
        title="Meus chamados"
        actions={
          hasTickets && (
            <ButtonLink to="/tickets/new" icon={<Plus />}>
              Novo chamado
            </ButtonLink>
          )
        }
      />

      {query.isPending ? (
        <div className="rounded-lg border border-gray-500">
          <TableSkeleton columns={4} />
        </div>
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : !hasTickets ? (
        <EmptyState
          title="Nenhum chamado ainda"
          description="Precisa de ajuda com o computador, a rede ou a impressora? Abra um chamado e um técnico disponível é atribuído na hora."
          action={
            <ButtonLink to="/tickets/new" icon={<Plus />}>
              Abrir meu primeiro chamado
            </ButtonLink>
          }
        />
      ) : (
        <>
          <TicketTable tickets={query.data.data} />
          <Pagination meta={query.data.meta} onChange={setPage} />
        </>
      )}
    </>
  )
}
