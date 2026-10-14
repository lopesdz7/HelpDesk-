import { useIsDesktop, usePrefersReducedMotion } from './useMediaQuery'

type NavigatorWithMemory = Navigator & { deviceMemory?: number }

let webglSupport: boolean | undefined

/** Testa uma vez se o navegador cria um contexto WebGL (e não é um renderizador por software). */
function hasCapableGpu() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return (webglSupport = false)

    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return (webglSupport = false)

    const nav = navigator as NavigatorWithMemory
    const lowEnd =
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) ||
      (nav.deviceMemory !== undefined && nav.deviceMemory <= 2)
    return (webglSupport = !lowEnd)
  } catch {
    return (webglSupport = false)
  }
}

/**
 * Regras do briefing para o 3D: só em telas ≥ 768px, sem `prefers-reduced-motion`
 * e com GPU capaz. Caso contrário, os componentes mostram a versão estática.
 */
export function useCan3D() {
  const isDesktop = useIsDesktop()
  const reducedMotion = usePrefersReducedMotion()
  return isDesktop && !reducedMotion && hasCapableGpu()
}
