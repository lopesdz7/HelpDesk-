import { cn } from '@/lib/cn'

type AvailabilityPillsProps = {
  hours: string[]
  /** Mostra no máximo N horários e um "+X" com o restante (listas). */
  max?: number
  className?: string
}

export function AvailabilityPills({ hours, max, className }: AvailabilityPillsProps) {
  if (hours.length === 0) {
    return <p className="text-xs text-gray-300 italic">Sem horários definidos</p>
  }

  const sorted = [...hours].sort()
  const visible = max ? sorted.slice(0, max) : sorted
  const rest = sorted.length - visible.length

  return (
    <ul className={cn('flex flex-wrap gap-1', className)} aria-label="Horários disponíveis">
      {visible.map((hour) => (
        <li
          key={hour}
          className="tabular flex h-7 items-center rounded-full border border-gray-500 px-3 text-xs font-bold text-gray-300"
        >
          {hour}
        </li>
      ))}
      {rest > 0 && (
        <li
          className="tabular flex h-7 items-center rounded-full border border-gray-500 px-3 text-xs font-bold text-gray-300"
          aria-label={`e mais ${rest} horários`}
        >
          +{rest}
        </li>
      )}
    </ul>
  )
}
