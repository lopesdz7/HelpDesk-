import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/AppError'

/** Campos públicos do usuário — nunca expor `password`. */
export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  availability: true,
  createdAt: true,
  updatedAt: true,
} as const

export const PASSWORD_SALT_ROUNDS = 8

export function hashPassword(password: string) {
  return hash(password, PASSWORD_SALT_ROUNDS)
}

/** Lança 409 se o e-mail já pertence a outro usuário. */
export async function ensureEmailAvailable(email: string, exceptUserId?: string) {
  const owner = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (owner && owner.id !== exceptUserId) {
    throw new AppError('Este e-mail já está em uso.', 409)
  }
}

export async function findUserOrFail(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) throw new AppError('Usuário não encontrado.', 404)
  return user
}
