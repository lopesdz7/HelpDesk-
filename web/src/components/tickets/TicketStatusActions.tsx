import { CircleCheckBig, Clock2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Ticket, TicketStatus, UserRole } from '@/lib/types'
import { availableTransitions } from './transitions'
import { useTicketStatus } from './useTicketStatus'

const ACTIONS: Record<TicketStatus, { label: string; icon: typeof Clock2 }> = {
  open: { label: 'Reabrir', icon: RotateCcw },
  in_progress: { label: 'Iniciar atendimento', icon: Clock2 },
  closed: { label: 'Encerrar', icon: CircleCheckBig },
}

type TicketStatusActionsProps = {
  ticket: Pick<Ticket, 'id' | 'status'>
  role: UserRole
  size?: 'md' | 'sm'
}

export function TicketStatusActions({ ticket, role, size = 'md' }: TicketStatusActionsProps) {
  const changeStatus = useTicketStatus()
  const transitions = availableTransitions(role, ticket.status)

  return transitions.map((next) => {
    const { label, icon: Icon } = ACTIONS[next]
    const isPending = changeStatus.isPending && changeStatus.variables?.status === next
    return (
      <Button
        key={next}
        variant={next === 'closed' && role === 'technician' ? 'primary' : 'secondary'}
        size={size}
        icon={<Icon />}
        loading={isPending}
        disabled={changeStatus.isPending && !isPending}
        onClick={() => changeStatus.mutate({ id: ticket.id, status: next })}
      >
        {label}
      </Button>
    )
  })
}
