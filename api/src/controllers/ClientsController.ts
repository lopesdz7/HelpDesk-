import type { Request, Response } from 'express'
import type { z } from 'zod'
import { uploadConfig } from '@/configs/upload'
import { paginated, paginationArgs } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { ensureEmailAvailable, userSelect } from '@/lib/users'
import type { updateClientBodySchema, userListQuerySchema } from '@/schemas/admin'
import { AppError } from '@/utils/AppError'

async function findClientOrFail(id: string) {
  const client = await prisma.user.findFirst({ where: { id, role: 'client' }, select: userSelect })
  if (!client) throw new AppError('Cliente não encontrado.', 404)
  return client
}

export class ClientsController {
  async index(request: Request, response: Response) {
    const query = request.query as unknown as z.infer<typeof userListQuerySchema>
    const where = { role: 'client' as const }

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { name: 'asc' },
        ...paginationArgs(query),
      }),
      prisma.user.count({ where }),
    ])

    response.json(paginated(clients, total, query))
  }

  async update(request: Request, response: Response) {
    const id = request.params.id as string
    const { name, email } = request.body as z.infer<typeof updateClientBodySchema>

    await findClientOrFail(id)
    await ensureEmailAvailable(email, id)

    const client = await prisma.user.update({
      where: { id },
      data: { name, email },
      select: userSelect,
    })

    response.json(client)
  }

  /** Exclui o cliente; os chamados dele são removidos em cascata (schema). */
  async delete(request: Request, response: Response) {
    const client = await findClientOrFail(request.params.id as string)

    await prisma.user.delete({ where: { id: client.id } })
    if (client.avatar) await uploadConfig.deleteFile(client.avatar)

    response.status(204).send()
  }
}
