import type { Request, Response } from 'express'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { findAccessibleTicketOrFail, findTicketOrFail, serializeTicket } from '@/lib/tickets'
import type { additionalServiceBodySchema } from '@/schemas/tickets'
import { AppError } from '@/utils/AppError'

/** Só o técnico atribuído, e só durante o atendimento (status in_progress). */
async function findTicketInProgressOrFail(request: Request) {
  const ticket = await findAccessibleTicketOrFail(request.params.id as string, request.user!)

  if (ticket.status !== 'in_progress') {
    throw new AppError('Serviços adicionais só podem ser alterados com o chamado em atendimento.')
  }

  return ticket
}

export class AdditionalServicesController {
  async create(request: Request, response: Response) {
    const { title, price } = request.body as z.infer<typeof additionalServiceBodySchema>
    const ticket = await findTicketInProgressOrFail(request)

    await prisma.additionalService.create({ data: { title, price, ticketId: ticket.id } })

    response.status(201).json(serializeTicket(await findTicketOrFail(ticket.id)))
  }

  async delete(request: Request, response: Response) {
    const ticket = await findTicketInProgressOrFail(request)
    const serviceId = request.params.serviceId as string

    const { count } = await prisma.additionalService.deleteMany({
      where: { id: serviceId, ticketId: ticket.id },
    })
    if (count === 0) throw new AppError('Serviço adicional não encontrado.', 404)

    response.json(serializeTicket(await findTicketOrFail(ticket.id)))
  }
}
