/**
 * Schemas dos formulários — espelham os da API (api/src/schemas), com mensagens em português.
 * Duplicados de propósito para manter os deploys da API e do front independentes (ver README).
 */
import { z } from 'zod'

const name = z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(100)
const email = z.string().trim().min(1, 'Informe o e-mail.').email('E-mail inválido.')
const password = z
  .string()
  .min(6, 'A senha deve ter pelo menos 6 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
})
export type SignInData = z.infer<typeof signInSchema>

export const signUpSchema = z.object({ name, email, password })
export type SignUpData = z.infer<typeof signUpSchema>

export const profileSchema = z.object({ name, email })
export type ProfileData = z.infer<typeof profileSchema>

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: password,
})
export type PasswordData = z.infer<typeof passwordSchema>

export const technicianSchema = z.object({
  name,
  email,
  password: password.optional(),
  availability: z.array(z.string()),
})
export type TechnicianData = z.infer<typeof technicianSchema>

export const clientSchema = z.object({ name, email })
export type ClientData = z.infer<typeof clientSchema>

/** Aceita "1.234,56", "1234,56" ou "1234.56". */
export function parseMoney(value: string) {
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value
  return Number(normalized.replace(/[^\d.]/g, ''))
}

const money = z
  .string()
  .trim()
  .min(1, 'Informe o valor.')
  .refine((value) => parseMoney(value) > 0, 'O valor deve ser maior que zero.')

export const serviceSchema = z.object({
  title: z.string().trim().min(2, 'O título deve ter pelo menos 2 caracteres.').max(120),
  price: money,
})
export type ServiceData = z.infer<typeof serviceSchema>

export const additionalServiceSchema = serviceSchema
export type AdditionalServiceData = ServiceData

export const ticketSchema = z.object({
  title: z.string().trim().min(3, 'O título deve ter pelo menos 3 caracteres.').max(120),
  description: z
    .string()
    .trim()
    .min(10, 'Descreva o problema com pelo menos 10 caracteres.')
    .max(2000),
  serviceId: z.string().min(1, 'Selecione a categoria do serviço.'),
})
export type TicketData = z.infer<typeof ticketSchema>
