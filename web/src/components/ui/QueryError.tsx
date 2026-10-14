import { CloudOff } from 'lucide-react'
import { getErrorMessage } from '@/lib/api'
import { Button } from './Button'

export function QueryError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-gray-500 px-6 py-10 text-center"
    >
      <CloudOff className="size-8 text-gray-400" aria-hidden />
      <div>
        <p className="text-md font-bold text-gray-200">Não foi possível carregar</p>
        <p className="text-sm text-gray-300">{getErrorMessage(error)}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  )
}
