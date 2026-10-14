import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusMetricCards } from '@/components/tickets/StatusMetricCards'
import { TicketTable } from '@/components/tickets/TicketTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { QueryError } from '@/components/ui/QueryError'
import { STATUS_LABEL } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { TicketStatus } from '@/lib/types'
import { ticketsService } from '@/services'

const VALID_STATUS = ['open', 'in_progress', 'closed'] as const

export function AdminTickets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status = VALID_STATUS.find((value) => value === statusParam)
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: queryKeys.ticketList({ status, page }),
    queryFn: () => ticketsService.list({ status, page }),
    placeholderData: keepPreviousData,
  })

  function selectStatus(next: TicketStatus | undefined) {
    setPage(1)
    setSearchParams(next ? { status: next } : {}, { replace: true })
  }

  return (
    <>
      <PageHeader title="Chamados" />

      <div className="flex flex-col gap-4 md:gap-6">
        <StatusMetricCards selected={status} onSelect={selectStatus} />

        <section aria-label="Lista de chamados" aria-busy={query.isFetching}>
          {status && (
            <p className="mb-3 text-sm text-gray-300" aria-live="polite">
              Mostrando chamados com status{' '}
              <strong className="text-gray-200">{STATUS_LABEL[status]}</strong>.{' '}
              <button
                type="button"
                onClick={() => selectStatus(undefined)}
                className="rounded-xs font-bold text-blue-dark underline-offset-2 hover:underline"
              >
                Ver todos
              </button>
            </p>
          )}

          {query.isPending ? (
            <div className="rounded-lg border border-gray-500">
              <TableSkeleton columns={5} />
            </div>
          ) : query.isError ? (
            <QueryError error={query.error} onRetry={() => query.refetch()} />
          ) : query.data.data.length === 0 ? (
            <EmptyState
              title={
                status
                  ? `Nenhum chamado ${STATUS_LABEL[status].toLowerCase()}`
                  : 'Nenhum chamado ainda'
              }
              description={
                status
                  ? 'Quando algum chamado estiver neste status, ele aparece aqui.'
                  : 'Os chamados abertos pelos clientes aparecem aqui, já atribuídos a um técnico.'
              }
            />
          ) : (
            <>
              <TicketTable tickets={query.data.data} showClient />
              <Pagination meta={query.data.meta} onChange={setPage} />
            </>
          )}
        </section>
      </div>
    </>
  )
}
