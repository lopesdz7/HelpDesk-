import { Outlet } from 'react-router-dom'
import { BrandPanel, StaticTicketBackdrop } from '@/components/three/BrandPanel'
import { Logo } from './Logo'

/**
 * Tela dividida do Figma: painel de marca à esquerda (cena 3D do ticket no desktop) e,
 * à direita, a área clara arredondada com o formulário.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh bg-gray-100">
      {/* No mobile, a marca vira uma faixa estática atrás do topo do painel. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-48 overflow-hidden md:hidden">
        <StaticTicketBackdrop />
      </div>
      <BrandPanel />
      <main className="relative mt-12 flex flex-1 flex-col items-center rounded-t-xl bg-gray-600 px-6 py-8 md:mt-3 md:rounded-t-none md:rounded-tl-xl md:px-12 md:py-12 lg:max-w-170">
        <div className="flex w-full max-w-100 flex-col gap-6 md:my-auto md:gap-8">
          <Logo tone="light" className="justify-center" />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
