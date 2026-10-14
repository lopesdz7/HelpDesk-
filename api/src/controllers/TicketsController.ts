import type { Request, Response } from 'express'
import type { z } from 'zod'
import { paginated, paginationArgs } from '@/lib/pagination'
import { prisma } from '@/lib/prisma'
import {
  findAccessibleTicketOrFail,
  serializeTicket,
  ticketInclude,
  ticketScope,
} from '@/lib/tickets'
import type { createTicketBodySchema, ticketListQuerySchema } from '@/schemas/tickets'
import { assignTechnician } from '@/services/assignTechnician'
import { AppError } from '@/utils/AppError'

export class TicketsController {
  async index(request: Request, response: Response) {
    const query = request.query as unknown as z.infer<typeof ticketListQuerySchema>
    const where = {
      ...ticketScope(request.user!),
      ...(query.status && { status: query.status }),
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: ticketInclude,
        orderBy: { updatedAt: 'desc' },
        ...paginationArgs(query),
      }),
      prisma.ticket.count({ where }),
    ])

    response.json(paginated(tickets.map(serializeTicket), total, query))
  }

  async show(request: Request, response: Response) {
    const ticket = await findAccessibleTicketOrFail(request.params.id as string, request.user!)
    response.json(serializeTicket(ticket))
  }

  async create(request: Request, response: Response) {
    const { title, description, serviceId } = request.body as z.infer<typeof createTicketBodySchema>

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new AppError('Serviço não encontrado.', 404)
    if (!service.active) throw new AppError('Este serviço não está mais disponível.')

    const technicianId = await assignTechnician()

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        serviceId,
        servicePrice: service.price, // snapshot do preço no momento da abertura
        clientId: request.user!.id,
        technicianId,
      },
      include: ticketInclude,
    })

    response.status(201).json(serializeTicket(ticket))
  }
}
