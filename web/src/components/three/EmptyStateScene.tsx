import { RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { createTicketShape, useBrandColors, useVisibleFrameloop } from './sceneUtils'

type Kind = 'inbox' | 'wrench'

/** Bandeja de entrada com um ticket repousando dentro. */
function Inbox() {
  const colors = useBrandColors()
  const ticket = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(createTicketShape(1.3, 0.75, 0.1, 0.15, 0.3), {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 3,
    })
    geo.center()
    return geo
  }, [])

  return (
    <group rotation={[0.5, 0, 0]}>
      {/* fundo e bordas da bandeja */}
      <RoundedBox args={[1.9, 0.12, 1.3]} radius={0.05} position={[0, -0.3, 0]}>
        <meshStandardMaterial color={colors.blueBase} roughness={0.55} />
      </RoundedBox>
      {[
        [0, -0.12, 0.62, 1.9, 0.36, 0.08],
        [0, -0.12, -0.62, 1.9, 0.36, 0.08],
        [0.92, -0.12, 0, 0.08, 0.36, 1.3],
        [-0.92, -0.12, 0, 0.08, 0.36, 1.3],
      ].map(([x, y, z, w, h, d], index) => (
        <RoundedBox key={index} args={[w!, h!, d!]} radius={0.03} position={[x!, y!, z!]}>
          <meshStandardMaterial color={colors.blueBase} roughness={0.55} />
        </RoundedBox>
      ))}
      <mesh geometry={ticket} position={[0, 0.02, 0.1]} rotation={[-Math.PI / 2 + 0.55, 0, 0.12]}>
        <meshStandardMaterial color={colors.blueLight} roughness={0.45} />
      </mesh>
    </group>
  )
}

/** Chave de boca estilizada. */
function Wrench() {
  const colors = useBrandColors()
  return (
    <group rotation={[0.3, 0, -0.7]}>
      <RoundedBox args={[0.26, 1.5, 0.14]} radius={0.06} position={[0, -0.25, 0]}>
        <meshStandardMaterial color={colors.blueBase} roughness={0.45} metalness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI / 2 + 0.55]}>
        <torusGeometry args={[0.3, 0.1, 16, 48, Math.PI * 1.55]} />
        <meshStandardMaterial color={colors.blueBase} roughness={0.45} metalness={0.2} />
      </mesh>
    </group>
  )
}

function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  // Giro lento — o objeto existe para dar personalidade, não para chamar atenção.
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35
  })
  return <group ref={group}>{children}</group>
}

function FrameDriver({ element }: { element: HTMLElement | null }) {
  useVisibleFrameloop(element)
  return null
}

export default function EmptyStateScene({ kind }: { kind: Kind }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  return (
    <div ref={setElement} className="size-full">
      <Canvas
        dpr={[1, 1.5]}
        flat
        frameloop="demand"
        camera={{ position: [0, 0.6, 3.6], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <FrameDriver element={element} />
        <hemisphereLight args={['#ffffff', '#c9cff5', 1.4]} />
        <directionalLight position={[2, 4, 4]} intensity={1.8} />
        <directionalLight position={[-3, 1, 2]} intensity={0.7} />
        <Spinner>{kind === 'inbox' ? <Inbox /> : <Wrench />}</Spinner>
      </Canvas>
    </div>
  )
}
