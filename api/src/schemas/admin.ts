import { z } from 'zod'
import { AVAILABLE_HOURS, DEFAULT_AVAILABILITY } from '@/utils/availability'
import { emailSchema, nameSchema, paginationSchema, passwordSchema } from './common'

/** Lista de blocos "HH:00" entre 07:00 e 22:00, sem repetição; devolvida em ordem. */
export const availabilitySchema = z
  .array(z.enum(AVAILABLE_HOURS, 'Horário inválido. Use blocos de 07:00 a 22:00.'))
  .refine((hours) => new Set(hours).size === hours.length, 'Há horários repetidos.')
  .transform((hours) => [...hours].sort())

export const createTechnicianBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  availability: availabilitySchema.default(DEFAULT_AVAILABILITY),
})

export const updateTechnicianBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  availability: availabilitySchema,
})

export const updateClientBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export const userListQuerySchema = paginationSchema

const priceSchema = z.coerce
  .number('Informe um valor numérico.')
  .positive('O valor deve ser maior que zero.')
  .max(99_999_999.99, 'Valor muito alto.')
  .transform((value) => value.toFixed(2))

export const serviceBodySchema = z.object({
  title: z.string().trim().min(2, 'O título deve ter pelo menos 2 caracteres.').max(120),
  price: priceSchema,
})

export const serviceStatusBodySchema = z.object({
  active: z.boolean('Informe true ou false.'),
})

export const serviceListQuerySchema = paginationSchema.extend({
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
})
