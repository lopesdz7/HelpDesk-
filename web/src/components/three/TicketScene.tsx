import { Environment, Float, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { createTicketShape, useBrandColors, useVisibleFrameloop } from './sceneUtils'

const WIDTH = 3.4
const HEIGHT = 1.9
const PERFORATION_X = 0.95

function TicketMesh() {
  const colors = useBrandColors()
  const group = useRef<THREE.Group>(null)
  const pointer = useThree((state) => state.pointer)

  const geometry = useMemo(() => {
    const shape = createTicketShape(WIDTH, HEIGHT, 0.22, 0.18, PERFORATION_X)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 6,
      curveSegments: 32,
    })
    geo.center()
    return geo
  }, [])

  // Furos do picote: pequenos discos ao longo da linha.
  const holes = useMemo(() => Array.from({ length: 9 }, (_, index) => -0.68 + index * 0.17), [])

  // Parallax suave seguindo o mouse.
  useFrame((_, delta) => {
    if (!group.current) return
    const ease = 1 - Math.exp(-delta * 3)
    group.current.rotation.y += (pointer.x * 0.35 - group.current.rotation.y) * ease
    group.current.rotation.x += (-pointer.y * 0.25 - group.current.rotation.x) * ease
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={colors.blueBase}
          roughness={0.55}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Linhas de "texto" do ticket */}
      {[
        [-0.5, 0.38, 1.3],
        [-0.7, 0.04, 0.9],
        [-0.57, -0.3, 1.16],
      ].map(([x, y, length], index) => (
        <RoundedBox key={index} args={[length!, 0.13, 0.04]} radius={0.06} position={[x!, y!, 0.1]}>
          <meshStandardMaterial
            color={colors.white}
            emissive={colors.white}
            emissiveIntensity={0.55}
            roughness={0.35}
          />
        </RoundedBox>
      ))}

      {/* Picote */}
      {holes.map((y) => (
        <mesh key={y} position={[PERFORATION_X, y, 0.105]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          <meshStandardMaterial color={colors.blueLight} roughness={0.5} />
        </mesh>
      ))}

      {/* Código no canhoto */}
      <RoundedBox args={[0.11, 0.9, 0.04]} radius={0.05} position={[1.4, 0, 0.1]}>
        <meshStandardMaterial color={colors.blueLight} roughness={0.5} />
      </RoundedBox>
    </group>
  )
}

function FrameDriver({ element }: { element: HTMLElement | null }) {
  useVisibleFrameloop(element)
  return null
}

/** Cena do painel lateral do login/cadastro (só carregada via React.lazy). */
export default function TicketScene() {
  const [element, setElement] = useState<HTMLDivElement | null>(null)

  return (
    <div ref={setElement} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [0, 0, 9.5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <FrameDriver element={element} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <Float
          speed={1.4}
          rotationIntensity={0.5}
          floatIntensity={0.8}
          floatingRange={[-0.12, 0.12]}
        >
          <group rotation={[0.2, -0.38, 0.1]}>
            <TicketMesh />
          </group>
        </Float>
        <Environment preset="city" environmentIntensity={0.6} />
      </Canvas>
    </div>
  )
}
