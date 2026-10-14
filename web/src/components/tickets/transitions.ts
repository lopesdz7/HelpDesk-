import type { TicketStatus, UserRole } from '@/lib/types'

/** Próximos status possíveis: técnico só avança um passo; admin vai para qualquer outro. */
export function availableTransitions(role: UserRole, status: TicketStatus): TicketStatus[] {
  if (role === 'technician') {
    if (status === 'open') return ['in_progress']
    if (status === 'in_progress') return ['closed']
    return []
  }
  if (role === 'admin') {
    return (['open', 'in_progress', 'closed'] as const).filter((next) => next !== status)
  }
  return []
}
