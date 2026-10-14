import type { Request, Response } from 'express'
import type { z } from 'zod'
import type { Prisma, Service } from '@/generated/prisma/client'
import { paginated, paginationArgs } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import type {
  serviceBodySchema,
  serviceListQuerySchema,
  serviceStatusBodySchema,
} from '@/schemas/admin'
import { AppError } from '@/utils/AppError'

export function serializeService(service: Service) {
  return { ...service, price: service.price.toNumber() }
}

async function findServiceOrFail(id: string) {
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw new AppError('Serviço não encontrado.', 404)
  return service
}

export class ServicesController {
  /** Cliente vê só os ativos; técnico e admin veem todos (com filtro opcional `?active=`). */
  async index(request: Request, response: Response) {
    const query = request.query as unknown as z.infer<typeof serviceListQuerySchema>
    const active = request.user!.role === 'client' ? true : query.active
    const where: Prisma.ServiceWhereInput = active === undefined ? {} : { active }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ active: 'desc' }, { title: 'asc' }],
        ...paginationArgs(query),
      }),
      prisma.service.count({ where }),
    ])

    response.json(paginated(services.map(serializeService), total, query))
  }

  async create(request: Request, response: Response) {
    const { title, price } = request.body as z.infer<typeof serviceBodySchema>

    const service = await prisma.service.create({ data: { title, price } })

    response.status(201).json(serializeService(service))
  }

  /** Alterar o preço não afeta chamados já abertos (eles guardam o snapshot `servicePrice`). */
  async update(request: Request, response: Response) {
    const id = request.params.id as string
    const { title, price } = request.body as z.infer<typeof serviceBodySchema>

    await findServiceOrFail(id)
    const service = await prisma.service.update({ where: { id }, data: { title, price } })

    response.json(serializeService(service))
  }

  /** Ativa/desativa (soft delete) — serviços nunca são apagados. */
  async updateStatus(request: Request, response: Response) {
    const id = request.params.id as string
    const { active } = request.body as z.infer<typeof serviceStatusBodySchema>

    await findServiceOrFail(id)
    const service = await prisma.service.update({ where: { id }, data: { active } })

    response.json(serializeService(service))
  }
}
