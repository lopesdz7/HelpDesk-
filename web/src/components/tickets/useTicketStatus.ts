import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api'
import { STATUS_LABEL } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import type { Ticket, TicketStatus } from '@/lib/types'
import { ticketsService } from '@/services'

/** Muda o status, atualiza o detalhe em cache e invalida as listas. */
export function useTicketStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketsService.updateStatus(id, status),
    onSuccess: (ticket: Ticket) => {
      queryClient.setQueryData(queryKeys.ticket(ticket.id), ticket)
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets })
      toast.success(`Chamado marcado como "${STATUS_LABEL[ticket.status]}".`)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
