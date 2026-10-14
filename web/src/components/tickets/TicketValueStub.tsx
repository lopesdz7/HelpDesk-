import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { AdditionalService } from '@/lib/types'

type TicketValueStubProps = {
  basePrice: number
  serviceTitle: string
  additionalServices?: AdditionalService[]
  total: number
  /** Quando informado, cada adicional ganha um botão de remover. */
  onRemove?: (service: AdditionalService) => void
  removingId?: string
  footer?: ReactNode
  className?: string
}

/** Recorte semicircular do picote — cobre a borda do card e desenha o arco. */
function Notch({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute top-1/2 size-5 -translate-y-1/2 rounded-full border border-gray-500 bg-gray-600',
        side === 'left' ? '-left-2.5' : '-right-2.5',
      )}
    />
  )
}

/**
 * Assinatura do produto: o resumo de valores como o canhoto de um ticket.
 * Serviço base e adicionais em cima, picote, e o total destacado embaixo.
 */
export function TicketValueStub({
  basePrice,
  serviceTitle,
  additionalServices = [],
  total,
  onRemove,
  removingId,
  footer,
  className,
}: TicketValueStubProps) {
  return (
    <section
      aria-label="Valores do chamado"
      className={cn('relative overflow-hidden rounded-lg border border-gray-500', className)}
    >
      <div className="flex flex-col gap-4 px-5 pt-5 pb-6 md:px-6">
        <h3 className="text-xs font-bold text-muted">Valores</h3>

        <dl className="flex flex-col gap-3 text-xs">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-gray-200">
              <span className="block font-bold">Preço base</span>
              <span className="text-gray-300">{serviceTitle}</span>
            </dt>
            <dd className="tabular shrink-0 text-gray-200">{formatCurrency(basePrice)}</dd>
          </div>

          {additionalServices.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-gray-500 pt-3">
              <dt className="font-bold text-gray-200">Adicionais</dt>
              {additionalServices.map((service) => (
                <dd key={service.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-gray-300">{service.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="tabular text-gray-200">{formatCurrency(service.price)}</span>
                    {onRemove && (
                      <IconButton
                        label={`Remover ${service.title}`}
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger"
                        icon={<Trash2 />}
                        loading={removingId === service.id}
                        onClick={() => onRemove(service)}
                      />
                    )}
                  </span>
                </dd>
              ))}
            </div>
          )}
        </dl>
      </div>

      {/* Picote */}
      <div className="relative h-0">
        <Notch side="left" />
        <Notch side="right" />
        <div className="mx-4 border-t-2 border-dashed border-gray-500" />
      </div>

      <div className="flex items-center justify-between gap-4 px-5 pt-6 pb-5 md:px-6">
        <span className="text-sm font-bold text-gray-200">Total</span>
        <strong className="tabular text-lg font-bold text-gray-200">{formatCurrency(total)}</strong>
      </div>
      {footer && <div className="px-5 pb-5 md:px-6">{footer}</div>}
    </section>
  )
}
