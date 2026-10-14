/**
 * Painel lateral das telas de login/cadastro. Nesta versão, só o fundo estático
 * (a cena 3D lazy entra na fase 6, com este mesmo fundo como fallback).
 */
export function BrandPanel() {
  return (
    <aside aria-hidden className="relative hidden flex-1 overflow-hidden md:block">
      <StaticTicketBackdrop />
    </aside>
  )
}

/** Fundo estático: gradiente dos tokens da marca. */
export function StaticTicketBackdrop() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-blue-base)_0%,var(--color-blue-dark)_45%,var(--color-gray-100)_100%)]" />
  )
}
