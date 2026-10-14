import { Component, type ReactNode } from 'react'

/** Se a cena falhar (WebGL perdido, HDR fora do ar), mostra o fallback estático. */
export class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
