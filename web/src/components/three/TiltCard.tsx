import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery'

const MAX_TILT = 6 // graus

/**
 * Inclinação 3D sutil no hover (até ~6°) com brilho especular que segue o ponteiro.
 * Só CSS transforms via framer-motion — sem WebGL. Desligada em reduced-motion e em toque.
 */
export function TiltCard({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const glareOpacity = useSpring(useMotionValue(0), { stiffness: 200, damping: 25 })
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.55), transparent 55%)`

  if (reducedMotion || !finePointer) return <div className="h-full">{children}</div>

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    rotateY.set((x - 0.5) * 2 * MAX_TILT)
    rotateX.set((0.5 - y) * 2 * MAX_TILT)
    glareX.set(x * 100)
    glareY.set(y * 100)
    glareOpacity.set(1)
  }

  function handleLeave() {
    rotateX.set(0)
    rotateY.set(0)
    glareOpacity.set(0)
  }

  return (
    <div className="h-full [perspective:800px]">
      <motion.div
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full rounded-lg will-change-transform"
      >
        {children}
        <motion.span
          aria-hidden
          style={{ background: glare, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-lg mix-blend-soft-light"
        />
      </motion.div>
    </div>
  )
}
