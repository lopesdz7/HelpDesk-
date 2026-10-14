import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/** Lê as cores dos tokens CSS (@theme) para a cena ficar presa à paleta da marca. */
export function useBrandColors() {
  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement)
    const token = (name: string, fallback: string) =>
      styles.getPropertyValue(`--color-${name}`).trim() || fallback
    return {
      blueDark: token('blue-dark', '#2e3da3'),
      blueBase: token('blue-base', '#5165e1'),
      blueLight: token('blue-light', '#8996eb'),
      white: token('white', '#ffffff'),
      gray600: token('gray-600', '#f9fafa'),
    }
  }, [])
}

/**
 * Silhueta do ticket: retângulo arredondado com dois recortes semicirculares (o picote)
 * nas laterais, na posição `perforationX`.
 */
export function createTicketShape(
  width: number,
  height: number,
  radius: number,
  notch: number,
  perforationX: number,
) {
  const w = width / 2
  const h = height / 2
  const shape = new THREE.Shape()
  shape.moveTo(-w + radius, -h)
  // base, com o recorte de baixo
  shape.lineTo(perforationX - notch, -h)
  shape.absarc(perforationX, -h, notch, Math.PI, 0, true)
  shape.lineTo(w - radius, -h)
  shape.quadraticCurveTo(w, -h, w, -h + radius)
  shape.lineTo(w, h - radius)
  shape.quadraticCurveTo(w, h, w - radius, h)
  // topo, com o recorte de cima
  shape.lineTo(perforationX + notch, h)
  shape.absarc(perforationX, h, notch, 0, Math.PI, true)
  shape.lineTo(-w + radius, h)
  shape.quadraticCurveTo(-w, h, -w, h - radius)
  shape.lineTo(-w, -h + radius)
  shape.quadraticCurveTo(-w, -h, -w + radius, -h)
  return shape
}

/**
 * Com `frameloop="demand"`, só pede quadros enquanto o canvas está visível na tela
 * e a aba está ativa — fora disso a GPU fica parada.
 */
export function useVisibleFrameloop(element: HTMLElement | null) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!element) return
    let visible = false
    let frame = 0

    const tick = () => {
      if (visible && document.visibilityState === 'visible') invalidate()
      frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
    })
    observer.observe(element)
    frame = requestAnimationFrame(tick)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [element, invalidate])
}
