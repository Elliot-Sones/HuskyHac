import { Billboard, Html } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";

/**
 * Parked taxi the player can walk up to in the airport scene.
 * Same primitive-style aesthetic as Character / AirportScene.
 */
export function Taxi({ position = [10, 0, 3] as [number, number, number] }) {
  const target = useGameStore((s) => s.proximityTarget);
  const mode = useGameStore((s) => s.mode);
  const isNear = target === "taxi";

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Body — main hull (Parisian-blue) */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.9, 0.55, 4.0]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Lower skirt */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[2.0, 0.25, 4.1]} />
        <meshStandardMaterial color="#0f1d3a" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Hood */}
      <mesh castShadow position={[0, 0.85, 1.55]}>
        <boxGeometry args={[1.85, 0.18, 0.95]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Trunk lid */}
      <mesh castShadow position={[0, 0.85, -1.55]}>
        <boxGeometry args={[1.85, 0.18, 0.95]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Cabin (greenhouse) */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[1.65, 0.7, 1.95]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.18, 0.95]} rotation={[Math.PI * 0.16, 0, 0]}>
        <boxGeometry args={[1.55, 0.6, 0.05]} />
        <meshStandardMaterial color="#0c1426" transparent opacity={0.55} metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.18, -0.95]} rotation={[-Math.PI * 0.16, 0, 0]}>
        <boxGeometry args={[1.55, 0.6, 0.05]} />
        <meshStandardMaterial color="#0c1426" transparent opacity={0.55} metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Side windows */}
      {[0.78, -0.78].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.05, 0.45, 1.55]} />
          <meshStandardMaterial color="#0c1426" transparent opacity={0.6} metalness={0.6} roughness={0.1} />
        </mesh>
      ))}

      {/* Roof TAXI sign (illuminated) */}
      <group position={[0, 1.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.18, 0.32]} />
          <meshStandardMaterial color="#fff" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
        {/* "TAXI" stripe */}
        <mesh position={[0, 0.0, 0.17]}>
          <boxGeometry args={[0.55, 0.1, 0.005]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* Headlights (front = +Z) */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.6, 2.0]}>
          <sphereGeometry args={[0.12, 16, 12]} />
          <meshStandardMaterial color="#fffbe6" emissive="#fff7c2" emissiveIntensity={0.9} />
        </mesh>
      ))}
      {/* Tail lights */}
      {[-0.65, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.65, -2.0]}>
          <boxGeometry args={[0.3, 0.12, 0.06]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Grille */}
      <mesh position={[0, 0.55, 2.02]}>
        <boxGeometry args={[1.3, 0.18, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Wheels */}
      {(
        [
          [-0.85, 0.3, 1.35],
          [0.85, 0.3, 1.35],
          [-0.85, 0.3, -1.35],
          [0.85, 0.3, -1.35],
        ] as [number, number, number][]
      ).map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.95} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.23, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* License plate (front + back) */}
      <mesh position={[0, 0.4, 2.06]}>
        <boxGeometry args={[0.7, 0.16, 0.02]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <mesh position={[0, 0.4, -2.06]}>
        <boxGeometry args={[0.7, 0.16, 0.02]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>

      {/* Floor ring + interaction prompt — ONLY visible when player is in world mode */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 2.5]}>
        <ringGeometry args={[0.9, 1.05, 48]} />
        <meshBasicMaterial
          color={isNear ? "#34d399" : "#fbbf24"}
          transparent
          opacity={0.7}
        />
      </mesh>

      <Billboard position={[0, 2.4, 0]}>
        <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
          <div className="glass-light text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-md ring-1 ring-amber-500/40 shadow-lg whitespace-nowrap">
            🚕 Taxi parisien · Stand de taxi
          </div>
        </Html>
      </Billboard>

      {isNear && mode === "world" && (
        <Billboard position={[0, 1.95, 2.5]}>
          <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-amber-400/40 pulse-ring"></div>
              <div className="relative bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg ring-2 ring-amber-300/40 pulse-dot whitespace-nowrap">
                <span className="font-mono mr-1.5 bg-white/20 rounded px-1 py-0.5 text-[10px]">
                  E
                </span>
                Get in the taxi
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
