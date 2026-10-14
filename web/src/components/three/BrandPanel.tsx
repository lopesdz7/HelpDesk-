import { lazy, Suspense } from 'react'
import { useCan3D } from '@/hooks/useCan3D'
import { SceneErrorBoundary } from './SceneErrorBoundary'

// three.js fica fora do bundle inicial: só é baixado quando a cena pode rodar.
const TicketScene = lazy(() => import('./TicketScene'))

/**
 * Painel lateral das telas de login/cadastro: fundo estático sempre presente e, no desktop
 * com GPU capaz e sem reduced-motion, a cena 3D do ticket por cima.
 */
export function BrandPanel() {
  const can3D = useCan3D()

  return (
    <aside aria-hidden className="relative hidden flex-1 overflow-hidden md:block">
      <StaticTicketBackdrop />
      {can3D ? (
        <SceneErrorBoundary fallback={<StaticTicket />}>
          <Suspense fallback={<StaticTicket />}>
            <TicketScene />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <StaticTicket />
      )}
    </aside>
  )
}

/** Fundo estático: gradiente dos tokens da marca. */
export function StaticTicketBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-blue-base)_0%,var(--color-blue-dark)_45%,var(--color-gray-100)_100%)]" />
  )
}

/** Fallback estático da cena: o mesmo ticket desenhado em SVG, levemente inclinado. */
function StaticTicket() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 340 190"
        className="w-[min(62%,26rem)] -rotate-6 drop-shadow-[0_24px_40px_rgb(21_22_25/0.35)]"
      >
        <path
          fill="var(--color-blue-base)"
          d="M22 0h99a18 18 0 0 0 36 0h161a22 22 0 0 1 22 22v146a22 22 0 0 1-22 22H157a18 18 0 0 0-36 0H22A22 22 0 0 1 0 168V22A22 22 0 0 1 22 0Z"
          transform="matrix(-1 0 0 1 340 0)"
        />
        <path
          stroke="var(--color-blue-light)"
          strokeWidth="5"
          strokeDasharray="1 16"
          strokeLinecap="round"
          d="M201 30v130"
        />
        <g fill="var(--color-white)">
          <rect x="40" y="48" width="130" height="12" rx="6" />
          <rect x="40" y="80" width="90" height="12" rx="6" />
          <rect x="40" y="112" width="116" height="12" rx="6" />
        </g>
        <rect x="262" y="50" width="10" height="90" rx="5" fill="var(--color-blue-light)" />
      </svg>
    </div>
  )
}
