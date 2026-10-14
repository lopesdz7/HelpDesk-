import type { TicketStatus } from './types'

export const queryKeys = {
  tickets: ['tickets'] as const,
  ticketList: (params: { status?: TicketStatus; page?: number; perPage?: number }) =>
    ['tickets', 'list', params] as const,
  ticket: (id: string) => ['tickets', 'detail', id] as const,
  ticketCount: (status: TicketStatus) => ['tickets', 'count', status] as const,
  services: ['services'] as const,
  serviceList: (params: { page?: number; active?: boolean; perPage?: number }) =>
    ['services', 'list', params] as const,
  technicians: ['technicians'] as const,
  technicianList: (page: number) => ['technicians', 'list', page] as const,
  technician: (id: string) => ['technicians', 'detail', id] as const,
  clients: ['clients'] as const,
  clientList: (page: number) => ['clients', 'list', page] as const,
}
