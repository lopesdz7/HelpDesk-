import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Paginated } from '@/lib/types'
import { IconButton } from './Button'

type PaginationProps = {
  meta: Paginated<unknown>['meta']
  onChange: (page: number) => void
}

export function Pagination({ meta, onChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null

  const from = (meta.page - 1) * meta.perPage + 1
  const to = Math.min(meta.page * meta.perPage, meta.total)

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-end gap-3 pt-4 text-xs text-gray-300"
    >
      <span className="tabular" aria-live="polite">
        {from}–{to} de {meta.total}
      </span>
      <div className="flex gap-1">
        <IconButton
          label="Página anterior"
          size="sm"
          icon={<ChevronLeft />}
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        />
        <IconButton
          label="Próxima página"
          size="sm"
          icon={<ChevronRight />}
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        />
      </div>
    </nav>
  )
}
