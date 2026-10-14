import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, SearchX } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { TicketStatusActions } from '@/components/tickets/TicketStatusActions'
import { TicketValueStub } from '@/components/tickets/TicketValueStub'
import { Avatar } from '@/components/ui/Avatar'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card, CardLabel } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCurrentUser } from '@/hooks/useAuth'
import { getErrorMessage } from '@/lib/api'
import { formatDate, formatTicketCode } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { additionalServiceSchema, type AdditionalServiceData } from '@/lib/schemas'
import type { AdditionalService, Ticket } from '@/lib/types'
import { ticketsService } from '@/services'
import { AxiosError } from 'axios'

export function TicketDetails() {
  const { id = '' } = useParams()
  const user = useCurrentUser()
  const query = useQuery({
    queryKey: queryKeys.ticket(id),
    queryFn: () => ticketsService.get(id),
    retry: (count, error) =>
      !(error instanceof AxiosError && [403, 404].includes(error.response?.status ?? 0)) &&
      count < 2,
  })
  const removeService = useRemoveAdditionalService(id)

  if (query.isPending) return <TicketDetailsSkeleton />

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <SearchX className="size-10 text-gray-400" aria-hidden />
        <div>
          <h1 className="text-lg font-bold text-gray-200">Chamado indisponível</h1>
          <p className="text-sm text-gray-300">{getErrorMessage(query.error)}</p>
        </div>
        <ButtonLink to="/" variant="secondary">
          Voltar para os chamados
        </ButtonLink>
      </div>
    )
  }

  const ticket = query.data
  const canEditServices = user.role === 'technician' && ticket.status === 'in_progress'

  return (
    <>
      <PageHeader
        title="Chamado detalhado"
        backTo="/"
        actions={<TicketStatusActions ticket={ticket} role={user.role} />}
      />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4 md:gap-6">
          <TicketInfoCard ticket={ticket} />
          {user.role === 'technician' && (
            <AdditionalServicesCard ticket={ticket} editable={canEditServices} />
          )}
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <Card className="flex flex-col gap-4">
            <CardLabel>Técnico responsável</CardLabel>
            <div className="flex items-center gap-3">
              <Avatar name={ticket.technician.name} avatar={ticket.technician.avatar} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-md font-bold text-gray-200">{ticket.technician.name}</p>
                <p className="truncate text-xs text-gray-300">{ticket.technician.email}</p>
              </div>
            </div>
          </Card>

          <TicketValueStub
            basePrice={ticket.servicePrice}
            serviceTitle={ticket.service.title}
            additionalServices={ticket.additionalServices}
            total={ticket.total}
            onRemove={canEditServices ? (service) => removeService.mutate(service) : undefined}
            removingId={removeService.isPending ? removeService.variables?.id : undefined}
          />
        </div>
      </div>
    </>
  )
}

function TicketInfoCard({ ticket }: { ticket: Ticket }) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="tabular text-xs font-bold text-gray-300">
            {formatTicketCode(ticket.code)}
          </span>
          <h2 className="text-md font-bold text-gray-200">{ticket.title}</h2>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <dl className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <CardLabel>Descrição</CardLabel>
          <dd className="mt-1 text-sm whitespace-pre-line text-gray-200">{ticket.description}</dd>
        </div>
        <div className="sm:col-span-2">
          <CardLabel>Categoria</CardLabel>
          <dd className="mt-1 text-sm text-gray-200">
            {ticket.service.title}
            {!ticket.service.active && (
              <span className="ml-2 text-xs text-gray-300 italic">(serviço desativado)</span>
            )}
          </dd>
        </div>
        <div>
          <CardLabel>Criado em</CardLabel>
          <dd className="tabular mt-1 text-sm text-gray-200">{formatDate(ticket.createdAt)}</dd>
        </div>
        <div>
          <CardLabel>Atualizado em</CardLabel>
          <dd className="tabular mt-1 text-sm text-gray-200">{formatDate(ticket.updatedAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <CardLabel>Cliente</CardLabel>
          <dd className="mt-2 flex items-center gap-2 text-sm text-gray-200">
            <Avatar name={ticket.client.name} avatar={ticket.client.avatar} size="sm" />
            {ticket.client.name}
          </dd>
        </div>
      </dl>
    </Card>
  )
}

function useRemoveAdditionalService(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (service: AdditionalService) => ticketsService.removeService(ticketId, service.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.ticket(ticketId), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets, refetchType: 'none' })
      toast.success('Serviço adicional removido.')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

function AdditionalServicesCard({ ticket, editable }: { ticket: Ticket; editable: boolean }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardLabel>Serviços adicionais</CardLabel>
        <p className="mt-1 text-sm text-gray-300">
          {editable
            ? 'Lance peças ou mão de obra extra. O total do chamado é atualizado na hora.'
            : ticket.status === 'open'
              ? 'Inicie o atendimento para lançar serviços adicionais.'
              : 'Chamado encerrado: os serviços não podem mais ser alterados.'}
        </p>
      </div>
      {editable && (
        <Button icon={<Plus />} onClick={() => setModalOpen(true)}>
          Adicionar serviço
        </Button>
      )}
      <AddServiceModal ticketId={ticket.id} open={modalOpen} onClose={() => setModalOpen(false)} />
    </Card>
  )
}

function AddServiceModal({
  ticketId,
  open,
  onClose,
}: {
  ticketId: string
  open: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const formId = useId()
  const form = useForm<AdditionalServiceData>({
    resolver: zodResolver(additionalServiceSchema),
    defaultValues: { title: '', price: '' },
  })

  const add = useMutation({
    mutationFn: (data: AdditionalServiceData) => ticketsService.addService(ticketId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.ticket(ticketId), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets, refetchType: 'none' })
      toast.success('Serviço adicional lançado.')
      form.reset()
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Serviço adicional"
      footer={
        <Button type="submit" form={formId} loading={add.isPending}>
          Salvar
        </Button>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit((data) => add.mutate(data))}
        className="flex flex-col gap-4"
      >
        <Input
          label="Descrição"
          placeholder="Ex.: Troca de memória RAM"
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

function TicketDetailsSkeleton() {
  return (
    <div role="status" aria-label="Carregando chamado">
      <Skeleton className="mb-2 h-3 w-14" />
      <Skeleton className="mb-6 h-7 w-56" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-80 rounded-lg" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
