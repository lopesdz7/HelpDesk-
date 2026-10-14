import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/AppError'
import { formatHour } from '@/utils/availability'

export type TechnicianCandidate = {
  id: string
  availability: string[]
  createdAt: Date
  /** Chamados ainda pendentes (open + in_progress). */
  load: number
}

/** Bloco de 1 hora ("HH:00") em que `date` cai, no fuso do negócio. */
export function getBusinessHour(date: Date, timeZone = env.TZ_BUSINESS) {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(date)
  return formatHour(Number(hour))
}

const byLoadThenSeniority = (a: TechnicianCandidate, b: TechnicianCandidate) =>
  a.load - b.load || a.createdAt.getTime() - b.createdAt.getTime()

/**
 * Regra do briefing: atribui a um técnico disponível no horário de criação; se ninguém
 * estiver disponível, ao de menor carga. Entre vários candidatos, vence o de menor carga
 * e, no empate, o cadastrado há mais tempo.
 */
export function pickTechnician(technicians: TechnicianCandidate[], hour: string) {
  const available = technicians.filter((technician) => technician.availability.includes(hour))
  const pool = available.length > 0 ? available : technicians
  return [...pool].sort(byLoadThenSeniority)[0]
}

export async function assignTechnician(now = new Date()) {
  const [technicians, loads] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'technician' },
      select: { id: true, availability: true, createdAt: true },
    }),
    prisma.ticket.groupBy({
      by: ['technicianId'],
      where: { status: { in: ['open', 'in_progress'] } },
      _count: { _all: true },
    }),
  ])

  const loadByTechnician = new Map(loads.map((item) => [item.technicianId, item._count._all]))
  const chosen = pickTechnician(
    technicians.map((technician) => ({
      ...technician,
      load: loadByTechnician.get(technician.id) ?? 0,
    })),
    getBusinessHour(now),
  )

  if (!chosen) {
    throw new AppError('Nenhum técnico cadastrado para atender o chamado. Tente mais tarde.', 503)
  }

  return chosen.id
}
