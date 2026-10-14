import type { Request, Response } from 'express'
import type { z } from 'zod'
import { paginated, paginationArgs } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import { ensureEmailAvailable, hashPassword, userSelect } from '@/lib/users'
import type {
  createTechnicianBodySchema,
  updateTechnicianBodySchema,
  userListQuerySchema,
} from '@/schemas/admin'
import { AppError } from '@/utils/AppError'

async function findTechnicianOrFail(id: string) {
  const technician = await prisma.user.findFirst({
    where: { id, role: 'technician' },
    select: userSelect,
  })
  if (!technician) throw new AppError('Técnico não encontrado.', 404)
  return technician
}

export class TechniciansController {
  async index(request: Request, response: Response) {
    const query = request.query as unknown as z.infer<typeof userListQuerySchema>
    const where = { role: 'technician' as const }

    const [technicians, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { name: 'asc' },
        ...paginationArgs(query),
      }),
      prisma.user.count({ where }),
    ])

    response.json(paginated(technicians, total, query))
  }

  async show(request: Request, response: Response) {
    response.json(await findTechnicianOrFail(request.params.id as string))
  }

  async create(request: Request, response: Response) {
    const { name, email, password, availability } = request.body as z.infer<
      typeof createTechnicianBodySchema
    >

    await ensureEmailAvailable(email)

    const technician = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        role: 'technician',
        availability,
      },
      select: userSelect,
    })

    response.status(201).json(technician)
  }

  async update(request: Request, response: Response) {
    const id = request.params.id as string
    const { name, email, availability } = request.body as z.infer<typeof updateTechnicianBodySchema>

    await findTechnicianOrFail(id)
    await ensureEmailAvailable(email, id)

    const technician = await prisma.user.update({
      where: { id },
      data: { name, email, availability },
      select: userSelect,
    })

    response.json(technician)
  }
}
