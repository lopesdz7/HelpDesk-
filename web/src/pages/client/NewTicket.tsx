import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserRoundCheck } from 'lucide-react'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card, CardLabel } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { getErrorMessage } from '@/lib/api'
import { formatCurrency, formatTicketCode } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { ticketSchema, type TicketData } from '@/lib/schemas'
import { servicesService, ticketsService } from '@/services'

export function NewTicket() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formId = useId()

  const services = useQuery({
    queryKey: queryKeys.serviceList({ active: true, perPage: 100 }),
    queryFn: () => servicesService.list({ perPage: 100 }),
  })

  const form = useForm<TicketData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: '', description: '', serviceId: '' },
  })
  const serviceId = useWatch({ control: form.control, name: 'serviceId' })
  const selected = services.data?.data.find((service) => service.id === serviceId)

  const create = useMutation({
    mutationFn: ticketsService.create,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      queryClient.setQueryData(queryKeys.ticket(ticket.id), ticket)
      toast.success(
        `Chamado ${formatTicketCode(ticket.code)} aberto. Técnico: ${ticket.technician.name}.`,
      )
      navigate(`/tickets/${ticket.id}`)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const { errors } = form.formState

  return (
    <>
      <PageHeader title="Novo chamado" backTo="/" />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <form
            id={formId}
            noValidate
            onSubmit={form.handleSubmit((data) => create.mutate(data))}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="text-md font-bold text-gray-200">Informações</h2>
              <p className="text-xs text-gray-300">Configure as informações do chamado</p>
            </div>
            <Input
              label="Título"
              placeholder="Digite um título para o chamado"
              {...form.register('title')}
              error={errors.title?.message}
            />
            <Textarea
              label="Descrição"
              placeholder="Descreva o que está acontecendo"
              {...form.register('description')}
              error={errors.description?.message}
            />
            <Select
              label="Categoria de serviço"
              placeholder={
                services.isPending ? 'Carregando serviços…' : 'Selecione a categoria de atendimento'
              }
              required
              disabled={services.isPending}
              {...form.register('serviceId')}
              error={
                errors.serviceId?.message ??
                (services.isError ? 'Não foi possível carregar os serviços.' : undefined)
              }
            >
              {services.data?.data.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </Select>
          </form>
        </Card>

        <Card className="flex h-fit flex-col gap-6">
          <div>
            <h2 className="text-md font-bold text-gray-200">Resumo</h2>
            <p className="text-xs text-gray-300">Valores e detalhes</p>
          </div>

          <dl className="flex flex-col gap-4">
            <div>
              <CardLabel as="dt">Categoria de serviço</CardLabel>
              <dd className="mt-1 text-sm text-gray-200">{selected?.title ?? '—'}</dd>
            </div>
            <div>
              <CardLabel as="dt">Custo inicial</CardLabel>
              <dd className="tabular mt-1 text-xl font-bold text-gray-200" aria-live="polite">
                {selected ? formatCurrency(selected.price) : 'R$ —'}
              </dd>
            </div>
          </dl>

          <p className="flex gap-2 text-xs text-gray-300">
            <UserRoundCheck className="size-4 shrink-0 text-blue-dark" aria-hidden />O chamado será
            atribuído automaticamente a um técnico disponível. Serviços extras podem ser somados
            durante o atendimento.
          </p>

          <Button type="submit" form={formId} loading={create.isPending}>
            Criar chamado
          </Button>
        </Card>
      </div>
    </>
  )
}
