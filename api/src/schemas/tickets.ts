import { z } from 'zod'
import { paginationSchema } from './common'

export const ticketStatusSchema = z.enum(['open', 'in_progress', 'closed'], 'Status inválido.')

export const createTicketBodySchema = z.object({
  title: z.string().trim().min(3, 'O título deve ter pelo menos 3 caracteres.').max(120),
  description: z
    .string()
    .trim()
    .min(10, 'Descreva o problema com pelo menos 10 caracteres.')
    .max(2000),
  serviceId: z.uuid('Selecione um serviço.'),
})

export const ticketListQuerySchema = paginationSchema.extend({
  status: ticketStatusSchema.optional(),
})

export const ticketStatusBodySchema = z.object({ status: ticketStatusSchema })

export const additionalServiceBodySchema = z.object({
  title: z.string().trim().min(2, 'O título deve ter pelo menos 2 caracteres.').max(120),
  price: z.coerce
    .number('Informe um valor numérico.')
    .positive('O valor deve ser maior que zero.')
    .max(99_999_999.99, 'Valor muito alto.')
    .transform((value) => value.toFixed(2)),
})

export const additionalServiceParamsSchema = z.object({
  id: z.uuid('ID inválido.'),
  serviceId: z.uuid('ID inválido.'),
})
