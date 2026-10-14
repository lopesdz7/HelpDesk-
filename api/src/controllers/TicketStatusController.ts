import type { Request, Response } from 'express'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  findAccessibleTicketOrFail,
  NEXT_STATUS,
  serializeTicket,
  ticketInclude,
} from '@/lib/tickets'
import type { ticketStatusBodySchema } from '@/schemas/tickets'
import { AppError } from '@/utils/AppError'

export class TicketStatusController {
  /** Técnico atribuído avança um passo por vez; admin pode definir qualquer status. */
  async update(request: Request, response: Response) {
    const { status } = request.body as z.infer<typeof ticketStatusBodySchema>
    const user = request.user!
    const ticket = await findAccessibleTicketOrFail(request.params.id as string, user)

    if (user.role === 'technician' && NEXT_STATUS[ticket.status] !== status) {
      throw new AppError(
        ticket.status === 'closed'
          ? 'Este chamado já foi encerrado.'
          : 'Transição de status inválida. O chamado deve seguir: aberto → em atendimento → encerrado.',
      )
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status },
      include: ticketInclude,
    })

    response.json(serializeTicket(updated))
  }
}
