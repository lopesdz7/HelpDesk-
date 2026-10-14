import { prisma } from '@/lib/prisma'

/** Limpa todas as tabelas — chamado no beforeEach de cada suíte. */
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "additional_services", "tickets", "services", "users" RESTART IDENTITY CASCADE',
  )
}
