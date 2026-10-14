import type { Prisma } from '@/generated/prisma/client'
import type { TicketStatus, UserRole } from '@/generated/prisma/enums'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/AppError'

const personSelect = { id: true, name: true, email: true, avatar: true } as const

export const ticketInclude = {
  client: { select: personSelect },
  technician: { select: personSelect },
  service: { select: { id: true, title: true, active: true } },
  additionalServices: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.TicketInclude

type TicketWithRelations = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>

/**
 * Converte os Decimals em number e calcula o total:
 * valor do serviço no momento da abertura + soma dos serviços adicionais.
 */
export function serializeTicket(ticket: TicketWithRelations) {
  const additionalServices = ticket.additionalServices.map((item) => ({
    ...item,
    price: item.price.toNumber(),
  }))
  const total = ticket.additionalServices.reduce(
    (sum, item) => sum.plus(item.price),
    ticket.servicePrice,
  )

  return {
    ...ticket,
    servicePrice: ticket.servicePrice.toNumber(),
    additionalServices,
    additionalTotal: total.minus(ticket.servicePrice).toNumber(),
    total: total.toNumber(),
  }
}

/** Escopo de leitura por papel: cliente vê os seus, técnico os atribuídos, admin todos. */
export function ticketScope(user: { id: string; role: UserRole }): Prisma.TicketWhereInput {
  if (user.role === 'client') return { clientId: user.id }
  if (user.role === 'technician') return { technicianId: user.id }
  return {}
}

export async function findTicketOrFail(id: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude })
  if (!ticket) throw new AppError('Chamado não encontrado.', 404)
  return ticket
}

/** 404 se não existe; 403 se existe mas o usuário não é o dono, o técnico atribuído ou admin. */
export async function findAccessibleTicketOrFail(id: string, user: { id: string; role: UserRole }) {
  const ticket = await findTicketOrFail(id)
  const allowed =
    user.role === 'admin' ||
    (user.role === 'client' && ticket.clientId === user.id) ||
    (user.role === 'technician' && ticket.technicianId === user.id)

  if (!allowed) throw new AppError('Você não tem permissão para acessar este chamado.', 403)
  return ticket
}

/** Fluxo do técnico: só avança um passo (open → in_progress → closed). */
export const NEXT_STATUS: Partial<Record<TicketStatus, TicketStatus>> = {
  open: 'in_progress',
  in_progress: 'closed',
}
