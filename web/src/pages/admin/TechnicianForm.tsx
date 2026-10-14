import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { getErrorMessage } from '@/lib/api'
import { DEFAULT_AVAILABILITY, SHIFTS } from '@/lib/availability'
import { cn } from '@/lib/cn'
import { queryKeys } from '@/lib/queryKeys'
import { technicianSchema, type TechnicianData } from '@/lib/schemas'
import { techniciansService } from '@/services'

// Na criação a senha provisória é obrigatória; na edição o campo nem aparece.
const createSchema = technicianSchema.extend({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').max(72),
})

export function TechnicianForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const technician = useQuery({
    queryKey: queryKeys.technician(id ?? ''),
    queryFn: () => techniciansService.get(id!),
    enabled: isEditing,
  })

  if (isEditing && technician.isPending) {
    return (
      <div role="status" aria-label="Carregando técnico">
        <Skeleton className="mb-6 h-7 w-56" />
        <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    )
  }

  if (isEditing && technician.isError) {
    return <QueryError error={technician.error} onRetry={() => technician.refetch()} />
  }

  return (
    <TechnicianFormContent
      id={id}
      defaults={
        technician.data
          ? {
              name: technician.data.name,
              email: technician.data.email,
              availability: technician.data.availability,
            }
          : { name: '', email: '', password: '', availability: DEFAULT_AVAILABILITY }
      }
    />
  )
}

function TechnicianFormContent({ id, defaults }: { id?: string; defaults: TechnicianData }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const formId = useId()
  const isEditing = Boolean(id)

  const form = useForm<TechnicianData>({
    resolver: zodResolver(isEditing ? technicianSchema : createSchema),
    defaultValues: defaults,
  })

  const save = useMutation({
    mutationFn: (data: TechnicianData) =>
      id ? techniciansService.update(id, data) : techniciansService.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.technicians })
      queryClient.setQueryData(queryKeys.technician(saved.id), saved)
      toast.success(isEditing ? 'Técnico atualizado.' : 'Técnico cadastrado.')
      navigate('/technicians')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const { errors } = form.formState

  return (
    <>
      <PageHeader
        title="Perfil de técnico"
        backTo="/technicians"
        actions={
          <>
            <ButtonLink to="/technicians" variant="secondary">
              Cancelar
            </ButtonLink>
            <Button type="submit" form={formId} loading={save.isPending}>
              Salvar
            </Button>
          </>
        }
      />

      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit((data) => save.mutate(data))}
        className="grid gap-4 md:gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
      >
        <Card className="flex h-fit flex-col gap-6">
          <div>
            <h2 className="text-md font-bold text-gray-200">Dados pessoais</h2>
            <p className="text-xs text-gray-300">
              {isEditing
                ? 'Edite os dados de identificação do técnico'
                : 'Defina as informações do perfil de técnico'}
            </p>
          </div>
          <Input
            label="Nome"
            placeholder="Nome completo"
            autoComplete="off"
            {...form.register('name')}
            error={errors.name?.message}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="exemplo@mail.com"
            autoComplete="off"
            {...form.register('email')}
            error={errors.email?.message}
          />
          {!isEditing && (
            <Input
              label="Senha"
              type="password"
              placeholder="Defina a senha de acesso"
              autoComplete="new-password"
              hint="Mínimo de 6 caracteres. O técnico pode trocá-la no perfil."
              {...form.register('password')}
              error={errors.password?.message}
            />
          )}
        </Card>

        <Card className="flex flex-col gap-6">
          <div>
            <h2 className="text-md font-bold text-gray-200">Horários de atendimento</h2>
            <p className="text-xs text-gray-300">
              Selecione os horários de disponibilidade do técnico. Os chamados novos são atribuídos
              a quem estiver disponível no horário de abertura.
            </p>
          </div>
          <Controller
            control={form.control}
            name="availability"
            render={({ field }) => (
              <AvailabilityGrid value={field.value} onChange={field.onChange} />
            )}
          />
        </Card>
      </form>
    </>
  )
}

/** Grade clicável por turno; cada horário é um toggle (aria-pressed). */
function AvailabilityGrid({
  value,
  onChange,
}: {
  value: string[]
  onChange: (hours: string[]) => void
}) {
  const selected = new Set(value)

  function toggle(hour: string) {
    const next = new Set(selected)
    if (next.has(hour)) next.delete(hour)
    else next.add(hour)
    onChange([...next].sort())
  }

  function toggleShift(hours: readonly string[]) {
    const allSelected = hours.every((hour) => selected.has(hour))
    const next = new Set(selected)
    for (const hour of hours) {
      if (allSelected) next.delete(hour)
      else next.add(hour)
    }
    onChange([...next].sort())
  }

  return (
    <div className="flex flex-col gap-5">
      {SHIFTS.map((shift) => {
        const allSelected = shift.hours.every((hour) => selected.has(hour))
        return (
          <fieldset key={shift.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <legend className="field-label text-gray-300">{shift.label}</legend>
              <button
                type="button"
                onClick={() => toggleShift(shift.hours)}
                className="rounded-xs text-xs font-bold text-blue-dark underline-offset-2 hover:underline"
              >
                {allSelected ? 'Limpar turno' : 'Turno inteiro'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {shift.hours.map((hour) => {
                const active = selected.has(hour)
                return (
                  <button
                    key={hour}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(hour)}
                    className={cn(
                      'tabular h-8 rounded-full border px-3 text-xs font-bold transition-colors duration-150',
                      active
                        ? 'border-blue-dark bg-blue-dark text-white hover:bg-blue-base'
                        : 'border-gray-500 text-gray-300 hover:border-gray-400 hover:text-gray-200',
                    )}
                  >
                    {hour}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
      <p className="text-xs text-gray-300" aria-live="polite">
        {value.length === 0
          ? 'Nenhum horário selecionado: o técnico só recebe chamados quando ninguém estiver disponível.'
          : `${value.length} ${value.length === 1 ? 'hora selecionada' : 'horas selecionadas'} por dia.`}
      </p>
    </div>
  )
}
