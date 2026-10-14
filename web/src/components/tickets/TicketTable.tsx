import { Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { formatCurrency, formatDate, formatTicketCode, shortName } from '@/lib/format'
import type { Ticket } from '@/lib/types'

type TicketTableProps = {
  tickets: Ticket[]
  /** Admin vê a coluna de cliente; o cliente não precisa dela. */
  showClient?: boolean
}

export function TicketTable({ tickets, showClient = false }: TicketTableProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-20 max-md:whitespace-normal md:w-28">Atualizado em</Th>
          <Th className="w-20 max-md:hidden">Id</Th>
          <Th>Título e serviço</Th>
          <Th className="text-right max-lg:hidden">Valor total</Th>
          {showClient && <Th className="max-xl:hidden">Cliente</Th>}
          <Th className="max-lg:hidden">Técnico</Th>
          <Th>Status</Th>
          <Th className="w-10 md:w-12">
            <span className="sr-only">Ações</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <Tr
            key={ticket.id}
            className="cursor-pointer"
            onClick={(event) => {
              // A linha inteira abre o detalhe; o link da última coluna é o alvo acessível.
              if ((event.target as HTMLElement).closest('a,button')) return
              navigate(`/tickets/${ticket.id}`)
            }}
          >
            <Td className="tabular text-xs md:whitespace-nowrap">{formatDate(ticket.updatedAt)}</Td>
            <Td className="tabular text-xs font-bold max-md:hidden">
              {formatTicketCode(ticket.code)}
            </Td>
            <Td>
              <span className="line-clamp-2 font-bold md:line-clamp-1">{ticket.title}</span>
              <span className="line-clamp-1 text-xs text-gray-300">{ticket.service.title}</span>
            </Td>
            <Td className="tabular text-right whitespace-nowrap max-lg:hidden">
              {formatCurrency(ticket.total)}
            </Td>
            {showClient && (
              <Td className="max-xl:hidden">
                <PersonCell name={ticket.client.name} avatar={ticket.client.avatar} />
              </Td>
            )}
            <Td className="max-lg:hidden">
              <PersonCell name={ticket.technician.name} avatar={ticket.technician.avatar} />
            </Td>
            <Td>
              <StatusBadge status={ticket.status} compact />
            </Td>
            <Td>
              <Link
                to={`/tickets/${ticket.id}`}
                aria-label={`Ver chamado ${formatTicketCode(ticket.code)}: ${ticket.title}`}
                title="Ver detalhes"
                className={buttonClasses({ variant: 'secondary', size: 'sm', iconOnly: true })}
              >
                <Eye aria-hidden />
              </Link>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}

function PersonCell({ name, avatar }: { name: string; avatar: string | null }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <Avatar name={name} avatar={avatar} size="xs" />
      <span className="text-sm">{shortName(name)}</span>
    </span>
  )
}
