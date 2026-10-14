import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from './common'

export const sessionBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe a senha.'),
})

export const signUpBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const profileBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export const passwordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: passwordSchema,
})
