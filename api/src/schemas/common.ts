import { z } from 'zod'

export const idParamsSchema = z.object({ id: z.uuid('ID inválido.') })

export const nameSchema = z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(100)
export const emailSchema = z.email('E-mail inválido.').trim().toLowerCase()
export const passwordSchema = z
  .string()
  .min(6, 'A senha deve ter pelo menos 6 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
})

export type Pagination = z.infer<typeof paginationSchema>
