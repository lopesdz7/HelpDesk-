import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('block animate-shimmer rounded-sm bg-gray-500', className)} />
  )
}

/** Linhas de tabela fantasma enquanto a lista carrega. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div role="status" aria-label="Carregando" className="divide-y divide-gray-500">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 px-3 py-4">
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton
              key={column}
              className={cn('h-3.5', column === 0 ? 'w-16' : column === 1 ? 'flex-1' : 'w-24')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
