import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { PenLine, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AvailabilityPills } from '@/components/AvailabilityPills'
import { Avatar } from '@/components/ui/Avatar'
import { ButtonLink } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryError } from '@/components/ui/QueryError'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { queryKeys } from '@/lib/queryKeys'
import { techniciansService } from '@/services'

export function Technicians() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const query = useQuery({
    queryKey: queryKeys.technicianList(page),
    queryFn: () => techniciansService.list({ page }),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader
        title="Técnicos"
        actions={
          <ButtonLink to="/technicians/new" icon={<Plus />}>
            Novo
          </ButtonLink>
        }
      />

      {query.isPending ? (
        <div className="rounded-lg border border-gray-500">
          <TableSkeleton columns={3} />
        </div>
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : query.data.data.length === 0 ? (
        <EmptyState
          object="wrench"
          title="Nenhum técnico cadastrado"
          description="Cadastre técnicos com seus horários: os chamados novos são atribuídos a quem estiver disponível."
          action={
            <ButtonLink to="/technicians/new" icon={<Plus />}>
              Cadastrar técnico
            </ButtonLink>
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Nome</Th>
                <Th className="max-md:hidden">E-mail</Th>
                <Th className="max-sm:hidden">Disponibilidade</Th>
                <Th className="w-12">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((technician) => (
                <Tr
                  key={technician.id}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('a')) return
                    navigate(`/technicians/${technician.id}`)
                  }}
                >
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={technician.name} avatar={technician.avatar} size="md" />
                      <span className="min-w-0">
                        <span className="block font-bold">{technician.name}</span>
                        <span className="block truncate text-xs text-gray-300 md:hidden">
                          {technician.email}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td className="text-gray-300 max-md:hidden">{technician.email}</Td>
                  <Td className="max-sm:hidden">
                    <AvailabilityPills
                      hours={technician.availability}
                      max={4}
                      className="flex-nowrap"
                    />
                  </Td>
                  <Td>
                    <Link
                      to={`/technicians/${technician.id}`}
                      aria-label={`Editar ${technician.name}`}
                      title="Editar"
                      className={buttonClasses({
                        variant: 'secondary',
                        size: 'sm',
                        iconOnly: true,
                      })}
                    >
                      <PenLine aria-hidden />
                    </Link>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination meta={query.data.meta} onChange={setPage} />
        </>
      )}
    </>
  )
}
