import { cn } from '@/lib/cn'

/** Marca: um ticket com picote — o mesmo motivo do resumo de valores e da cena 3D. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-10', className)} aria-hidden>
      <path
        fill="var(--color-blue-dark)"
        d="M8 6h24a4 4 0 0 1 4 4v7a3 3 0 0 0 0 6v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7a3 3 0 0 0 0-6v-7a4 4 0 0 1 4-4Z"
      />
      <path
        stroke="var(--color-blue-light)"
        strokeWidth="1.6"
        strokeDasharray="2.4 2.4"
        strokeLinecap="round"
        d="M27 9.5v21"
      />
      <path
        stroke="var(--color-white)"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M11 15h10M11 20h7M11 25h9"
      />
    </svg>
  )
}

type LogoProps = { subtitle?: string; tone?: 'dark' | 'light'; className?: string }

export function Logo({ subtitle, tone = 'dark', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark />
      <div className="flex flex-col">
        <span
          className={cn(
            'text-lg leading-none font-bold',
            tone === 'dark' ? 'text-gray-600' : 'text-blue-dark',
          )}
        >
          HelpDesk
        </span>
        {subtitle && (
          <span className="mt-1 text-xxs font-bold tracking-wide text-blue-light uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
