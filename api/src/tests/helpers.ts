import fs from 'node:fs'
import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { authConfig } from '@/configs/auth'
import { uploadConfig } from '@/configs/upload'
import type { UserRole } from '@/generated/prisma/enums'
import { prisma } from '@/lib/prisma'

export const DEFAULT_PASSWORD = '123456'

// Hash calculado uma vez só — bcrypt é lento de propósito.
let passwordHash: string | undefined

/** Limpa todas as tabelas — chamado no beforeEach de cada suíte. */
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "additional_services", "tickets", "services", "users" RESTART IDENTITY CASCADE',
  )
}

export function clearUploads() {
  fs.rmSync(uploadConfig.UPLOADS_FOLDER, { recursive: true, force: true })
}

let sequence = 0

type UserOverrides = { name?: string; email?: string; availability?: string[]; createdAt?: Date }

export async function createUser(role: UserRole, overrides: UserOverrides = {}) {
  passwordHash ??= await hash(DEFAULT_PASSWORD, 4)
  sequence += 1

  return prisma.user.create({
    data: {
      name: overrides.name ?? `${role} ${sequence}`,
      email: overrides.email ?? `${role}${sequence}@test.com`,
      password: passwordHash,
      role,
      availability: overrides.availability ?? [],
      createdAt: overrides.createdAt,
    },
  })
}

export function tokenFor(user: { id: string; role: UserRole }) {
  return sign({ role: user.role }, authConfig.jwt.secret, { subject: user.id, expiresIn: '1h' })
}

/** Cria um usuário e devolve junto o header Authorization pronto para o supertest. */
export async function createAuthenticated(role: UserRole, overrides: UserOverrides = {}) {
  const user = await createUser(role, overrides)
  return { user, auth: { Authorization: `Bearer ${tokenFor(user)}` } }
}

export function createService(overrides: { title?: string; price?: string; active?: boolean } = {}) {
  sequence += 1
  return prisma.service.create({
    data: {
      title: overrides.title ?? `Serviço ${sequence}`,
      price: overrides.price ?? '100.00',
      active: overrides.active ?? true,
    },
  })
}
