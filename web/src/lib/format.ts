import type { TicketStatus } from './types'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatCurrency(value: number) {
  return currency.format(value)
}

const dateParts = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** dd/MM/yy HH:mm */
export function formatDate(value: string | Date) {
  const parts = Object.fromEntries(
    dateParts.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  )
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
}

/** 4 → "#00004" */
export function formatTicketCode(code: number) {
  return `#${String(code).padStart(5, '0')}`
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em atendimento',
  closed: 'Encerrado',
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** "Carlos Silva" → "Carlos S." — usado em listas estreitas. */
export function shortName(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length < 2) return name
  return `${words[0]} ${words[words.length - 1]?.[0]}.`
}
