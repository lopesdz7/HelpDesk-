import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate, formatTicketCode } from '@/lib/format'
import type { Ticket, UserRole } from '@/lib/types'
import { TicketStatusActions } from './TicketStatusActions'

type TicketCardProps = {
  ticket: Ticket
  role: UserRole
  /** Quem aparece no rodapé: o cliente (fila do técnico) ou o técnico (visão do cliente). */
  person?: 'client' | 'technician'
  /** Ações rápidas de status no rodapé (fila do técnico). */
  showActions?: boolean
}

/** Card de chamado: o título leva ao detalhe; opcionalmente, a ação rápida muda o status. */
export function TicketCard({
  ticket,
  role,
  person = 'client',
  showActions = true,
}: TicketCardProps) {
  const shown = ticket[person]
  return (
    <article className="relative flex flex-col gap-4 rounded-lg border border-gray-500 p-5 transition-colors focus-within:border-gray-400 hover:border-gray-400">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tabular text-xs font-bold text-gray-300">
            {formatTicketCode(ticket.code)}
          </span>
          <h3 className="line-clamp-2 text-md font-bold text-gray-200">
            <Link
              to={`/tickets/${ticket.id}`}
              className="rounded-xs after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-blue-base"
            >
              {ticket.title}
            </Link>
          </h3>
          <p className="truncate text-xs text-gray-300">{ticket.service.title}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </header>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="tabular text-gray-300">{formatDate(ticket.updatedAt)}</span>
        <span className="tabular font-bold text-gray-200">{formatCurrency(ticket.total)}</span>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-gray-500 pt-4">
        <span className="flex min-w-0 items-center gap-2 text-sm text-gray-200">
          <Avatar name={shown.name} avatar={shown.avatar} size="sm" />
          <span className="truncate">
            <span className="sr-only">{person === 'client' ? 'Cliente: ' : 'Técnico: '}</span>
            {shown.name}
          </span>
        </span>
        {/* Acima do link "esticado" do título, para continuar clicável. */}
        {showActions && (
          <span className="relative z-10 flex gap-2">
            <TicketStatusActions ticket={ticket} role={role} size="sm" />
          </span>
        )}
      </footer>
    </article>
  )
}
