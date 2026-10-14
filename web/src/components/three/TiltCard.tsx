import type { ReactNode } from 'react'

/** Versão sem efeito; a inclinação 3D (framer-motion) entra na fase 6. */
export function TiltCard({ children }: { children: ReactNode }) {
  return <div className="h-full">{children}</div>
}
