import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, CircleCheck, PenLine, Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button, IconButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { QueryError } from '@/components/ui/QueryError'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { serviceSchema, type ServiceData } from '@/lib/schemas'
import type { Service } from '@/lib/types'
import { servicesService } from '@/services'

/** `null` = modal de criação; um serviço = edição; `undefined` = fechado. */
type Editing = Service | null | undefined

export function Services() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Editing>()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.serviceList({ page }),
    queryFn: () => servicesService.list({ page }),
    placeholderData: keepPreviousData,
  })

  const toggle = useMutation({
    mutationFn: (service: Service) => servicesService.setActive(service.id, !service.active),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
      toast.success(
        service.active ? 'Serviço reativado.' : 'Serviço desativado. Chamados antigos não mudam.',
      )
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <>
      <PageHeader
        title="Serviços"
        actions={
          <Button icon={<Plus />} onClick={() => setEditing(null)}>
            Novo
          </Button>
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
          title="Nenhum serviço cadastrado"
          description="Os serviços são as categorias que o cliente escolhe ao abrir um chamado, cada uma com seu valor base."
          action={
            <Button icon={<Plus />} onClick={() => setEditing(null)}>
              Cadastrar serviço
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Título</Th>
                <Th className="text-right">Valor</Th>
                <Th className="max-md:hidden">Status</Th>
                <Th className="md:w-44">
                  <span className="sr-only">Ações</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {query.data.data.map((service) => (
                <Tr key={service.id}>
                  <Td>
                    <span className={cn('font-bold', !service.active && 'text-gray-300')}>
                      {service.title}
                    </span>
                    <ActiveBadge
                      active={service.active}
                      className="mt-1 w-fit max-md:flex md:hidden"
                    />
                  </Td>
                  <Td className="tabular text-right whitespace-nowrap">
                    {formatCurrency(service.price)}
                  </Td>
                  <Td className="max-md:hidden">
                    <ActiveBadge active={service.active} />
                  </Td>
                  <Td>
                    <span className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={service.active ? <Ban /> : <CircleCheck />}
                        loading={toggle.isPending && toggle.variables?.id === service.id}
                        onClick={() => toggle.mutate(service)}
                        aria-label={`${service.active ? 'Desativar' : 'Reativar'} ${service.title}`}
                      >
                        <span className="max-sm:hidden">
                          {service.active ? 'Desativar' : 'Reativar'}
                        </span>
                      </Button>
                      <IconButton
                        label={`Editar ${service.title}`}
                        size="sm"
                        icon={<PenLine />}
                        onClick={() => setEditing(service)}
                      />
                    </span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination meta={query.data.meta} onChange={setPage} />
        </>
      )}

      <ServiceModal editing={editing} onClose={() => setEditing(undefined)} />
    </>
  )
}

function ActiveBadge({ active, className }: { active: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2 text-xs font-bold',
        active ? 'bg-done/12 text-done-ink' : 'bg-gray-500 text-gray-300',
        className,
      )}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}

const priceToField = (price: number) => price.toFixed(2).replace('.', ',')

function ServiceModal({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const queryClient = useQueryClient()
  const formId = useId()
  const form = useForm<ServiceData>({
    resolver: zodResolver(serviceSchema),
    values:
      editing === undefined
        ? undefined
        : editing
          ? { title: editing.title, price: priceToField(editing.price) }
          : { title: '', price: '' },
  })

  const save = useMutation({
    mutationFn: (data: ServiceData) =>
      editing ? servicesService.update(editing.id, data) : servicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services })
      toast.success(editing ? 'Serviço atualizado.' : 'Serviço cadastrado.')
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Modal
      open={editing !== undefined}
      onClose={onClose}
      title={editing ? 'Serviço' : 'Cadastro de serviço'}
      description={editing ? 'Mudar o valor não altera chamados já abertos.' : undefined}
      footer={
        <Button type="submit" form={formId} loading={save.isPending}>
          Salvar
        </Button>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit((data) => save.mutate(data))}
        className="flex flex-col gap-5"
      >
        <Input
          label="Título"
          placeholder="Nome do serviço"
          {...form.register('title')}
          error={form.formState.errors.title?.message}
        />
        <Input
          label="Valor"
          prefix="R$"
          inputMode="decimal"
          placeholder="0,00"
          {...form.register('price')}
          error={form.formState.errors.price?.message}
        />
      </form>
    </Modal>
  )
}
