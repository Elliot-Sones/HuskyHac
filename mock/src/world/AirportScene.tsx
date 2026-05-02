import { ContactShadows, Text } from "@react-three/drei";
import { Character } from "./Character";

type V3 = [number, number, number];

const flightRows = [
  ["AF 011", "Paris", "09:15", "Arrivee", "Belt 4"],
  ["TS 245", "Montreal", "09:42", "Arrivee", "Belt 2"],
  ["BA 341", "London", "10:08", "A l'heure", "Gate C7"],
  ["LH 479", "Berlin", "10:22", "Retarde", "Gate B2"],
];

const kioskPositions: V3[] = [
  [-8, 0, 4],
  [-6.8, 0, 4],
  [-5.6, 0, 4],
];

const queuePosts: V3[] = [
  [2.6, 0, -0.7],
  [4.0, 0, -0.7],
  [5.4, 0, -0.7],
  [2.6, 0, -2.0],
  [4.0, 0, -2.0],
  [5.4, 0, -2.0],
];

const luggagePositions: Array<[V3, string, number]> = [
  [[-9.7, 0.42, -1.4], "#dc2626", 0.2],
  [[-8.4, 0.42, -2.0], "#2563eb", -0.3],
  [[-6.9, 0.42, -1.1], "#f59e0b", 0.45],
  [[-3.2, 0.18, 1.7], "#111827", -0.5],
  [[-2.5, 0.22, 2.3], "#16a34a", 0.1],
];

export function AirportScene() {
  return (
    <>
      <hemisphereLight args={["#dcecff", "#5f5146", 0.52]} />

      <TerminalShell />
      <FloorMarkings />
      <GlassWall />
      <InformationDesk />
      <ArrivalsBoard />
      <OverheadWayfinding />
      <BaggageClaim />
      <QueueArea />
      <Kiosks />
      <PassengerCluster />

      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.55}
        blur={2.4}
        scale={42}
        far={8}
        resolution={1024}
      />
    </>
  );
}

function TerminalShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[72, 54]} />
        <meshStandardMaterial color="#d9dde1" roughness={0.84} metalness={0.03} />
      </mesh>

      <mesh position={[0, 5.95, -13.4]} receiveShadow>
        <boxGeometry args={[46, 0.35, 0.5]} />
        <meshStandardMaterial color="#cad1d8" roughness={0.58} />
      </mesh>

      {[-18, -9, 0, 9, 18].map((x) => (
        <group key={x} position={[x, 0, -10.7]}>
          <mesh castShadow receiveShadow position={[0, 2.8, 0]}>
            <boxGeometry args={[0.62, 5.6, 0.62]} />
            <meshStandardMaterial color="#f0ebe2" roughness={0.72} />
          </mesh>
          <mesh position={[0, 5.66, 0]}>
            <boxGeometry args={[2.3, 0.22, 0.82]} />
            <meshStandardMaterial color="#9aa4af" roughness={0.52} metalness={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FloorMarkings() {
  return (
    <group position={[0, 0.006, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.6]}>
        <planeGeometry args={[2.4, 25]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 5.6]}>
        <planeGeometry args={[0.42, 25]} />
        <meshStandardMaterial color="#f5c542" roughness={0.48} />
      </mesh>
      {[-2.5, 0, 2.5, 5].map((z) => (
        <group key={z} position={[0, 0.01, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.55]}>
            <coneGeometry args={[0.55, 1.25, 3]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <Text
            rotation={[-Math.PI / 2, 0, 0]}
            position={[1.75, 0.012, 0]}
            fontSize={0.32}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            ARRIVEES
          </Text>
        </group>
      ))}
    </group>
  );
}

function GlassWall() {
  return (
    <group position={[0, 0, -13.8]}>
      {[-15, -10, -5, 0, 5, 10, 15].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.45, 0]} receiveShadow>
            <boxGeometry args={[4.4, 4.7, 0.08]} />
            <meshPhysicalMaterial
              color="#bfe0ee"
              roughness={0.1}
              metalness={0}
              transmission={0.25}
              transparent
              opacity={0.34}
            />
          </mesh>
          <mesh position={[2.25, 2.45, 0.04]}>
            <boxGeometry args={[0.08, 4.9, 0.12]} />
            <meshStandardMaterial color="#64748b" roughness={0.34} metalness={0.45} />
          </mesh>
        </group>
      ))}
      <Text position={[0, 3.9, 0.12]} fontSize={0.42} color="#0f172a" anchorX="center">
        Arrivees internationales
      </Text>
      <Text position={[0, 3.3, 0.12]} fontSize={0.26} color="#475569" anchorX="center">
        Paris · France
      </Text>
    </group>
  );
}

function InformationDesk() {
  return (
    <group position={[5, 0, -3]}>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <boxGeometry args={[5.4, 1.16, 1.45]} />
        <meshStandardMaterial color="#0f1d2e" roughness={0.38} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[5.65, 0.12, 1.65]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.32} metalness={0.24} />
      </mesh>
      <mesh position={[0, 0.58, 0.76]}>
        <boxGeometry args={[4.5, 0.44, 0.04]} />
        <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.28} />
      </mesh>
      <Text position={[0, 0.6, 0.82]} fontSize={0.28} color="#fde68a" anchorX="center">
        i
      </Text>

      <HangingSign position={[0, 3.35, 0.06]} size={[3.9, 0.86, 0.12]} color="#0b1b34">
        <Text position={[0, 0.12, 0.08]} fontSize={0.32} color="#fde68a" anchorX="center">
          INFORMATION
        </Text>
        <Text position={[0, -0.24, 0.08]} fontSize={0.18} color="#fbbf24" anchorX="center">
          Renseignements
        </Text>
      </HangingSign>

      <group position={[0.95, 0, -0.15]} rotation={[0, Math.PI, 0]}>
        <Character
          color="#1e3a8a"
          skin="#fde0c2"
          hair="#854d0e"
          pants="#0f172a"
          accessory="nametag"
        />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.95, 0.018, -0.65]}>
        <ringGeometry args={[0.95, 1.12, 56]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.55} />
      </mesh>
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.95, 0.024, -0.65]}
        fontSize={0.22}
        color="#064e3b"
        anchorX="center"
        anchorY="middle"
      >
        TALK
      </Text>
    </group>
  );
}

function ArrivalsBoard() {
  return (
    <group position={[-7.6, 0, -6.5]} rotation={[0, 0.08, 0]}>
      <mesh castShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[7.3, 4.25, 0.24]} />
        <meshStandardMaterial color="#020617" roughness={0.48} />
      </mesh>
      <mesh position={[0, 2.55, 0.15]}>
        <boxGeometry args={[6.85, 3.85, 0.06]} />
        <meshStandardMaterial color="#071a36" emissive="#0f3b6f" emissiveIntensity={0.48} />
      </mesh>
      <Text position={[-3.05, 4.05, 0.2]} fontSize={0.24} color="#93c5fd" anchorX="left">
        DEPARTURES
      </Text>
      <Text position={[-0.55, 4.05, 0.2]} fontSize={0.34} color="#facc15" anchorX="left">
        ARRIVALS / ARRIVEES
      </Text>
      {flightRows.map(([flight, city, time, status, belt], i) => {
        const y = 3.38 - i * 0.62;
        return (
          <group key={flight} position={[0, y, 0.21]}>
            <mesh position={[0, -0.22, -0.01]}>
              <boxGeometry args={[6.5, 0.03, 0.015]} />
              <meshStandardMaterial color="#1e3a8a" emissive="#1e3a8a" emissiveIntensity={0.2} />
            </mesh>
            <Text position={[-3.05, 0, 0]} fontSize={0.22} color="#fde68a" anchorX="left">
              {flight}
            </Text>
            <Text position={[-1.75, 0, 0]} fontSize={0.22} color="#e0f2fe" anchorX="left">
              {city}
            </Text>
            <Text position={[0.28, 0, 0]} fontSize={0.22} color="#fde68a" anchorX="left">
              {time}
            </Text>
            <Text
              position={[1.22, 0, 0]}
              fontSize={0.2}
              color={status === "Retarde" ? "#fb7185" : "#34d399"}
              anchorX="left"
            >
              {status}
            </Text>
            <Text position={[2.55, 0, 0]} fontSize={0.2} color="#bfdbfe" anchorX="left">
              {belt}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function OverheadWayfinding() {
  return (
    <group>
      <HangingSign position={[0, 4.55, 7.2]} size={[5.8, 0.78, 0.14]} color="#174f9c">
        <Text position={[0, 0.08, 0.08]} fontSize={0.26} color="#ffffff" anchorX="center">
          Sortie / Exit  |  Taxi  |  Trains
        </Text>
        <Text position={[0, -0.22, 0.08]} fontSize={0.18} color="#fde68a" anchorX="center">
          Arrivees internationales →
        </Text>
      </HangingSign>
      <HangingSign position={[8.2, 4.25, 3]} size={[4.25, 0.7, 0.14]} color="#111827">
        <Text position={[0, 0, 0.08]} fontSize={0.22} color="#f8fafc" anchorX="center">
          Bagages / Baggage Claim ←
        </Text>
      </HangingSign>
      <HangingSign position={[-7.2, 4.35, 0.7]} size={[3.8, 0.68, 0.14]} color="#0f766e">
        <Text position={[0, 0, 0.08]} fontSize={0.22} color="#ecfeff" anchorX="center">
          Paris · France
        </Text>
      </HangingSign>
    </group>
  );
}

function BaggageClaim() {
  return (
    <group position={[-7.5, 0, -1.5]}>
      <mesh receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[7.4, 0.32, 2.2]} />
        <meshStandardMaterial color="#475569" roughness={0.36} metalness={0.42} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[2.65, 0.28, 12, 64]} />
        <meshStandardMaterial color="#1f2937" roughness={0.48} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.53, 0]}>
        <torusGeometry args={[2.65, 0.035, 8, 64]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.8} />
      </mesh>
      {luggagePositions.map(([position, color, rotation]) => (
        <Luggage key={`${position[0]}-${position[2]}`} position={position} color={color} rotation={rotation} />
      ))}
      <Text position={[0, 2.15, -1.2]} fontSize={0.32} color="#0f172a" anchorX="center">
        BAGAGES 4
      </Text>
    </group>
  );
}

function QueueArea() {
  return (
    <group>
      {queuePosts.map((position) => (
        <mesh key={`${position[0]}-${position[2]}`} position={[position[0], 0.55, position[2]]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 1.1, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.55} />
        </mesh>
      ))}
      {[
        [[3.3, 1.02, -0.7], [1.4, 0.07, 0.07]],
        [[4.7, 1.02, -0.7], [1.4, 0.07, 0.07]],
        [[3.3, 1.02, -2.0], [1.4, 0.07, 0.07]],
        [[4.7, 1.02, -2.0], [1.4, 0.07, 0.07]],
        [[2.6, 1.02, -1.35], [0.07, 0.07, 1.3]],
        [[5.4, 1.02, -1.35], [0.07, 0.07, 1.3]],
      ].map(([position, scale]) => (
        <mesh key={`${position[0]}-${position[2]}`} position={position as V3} castShadow>
          <boxGeometry args={scale as V3} />
          <meshStandardMaterial color="#c1121f" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Kiosks() {
  return (
    <group>
      {kioskPositions.map((position, index) => (
        <group key={position[0]} position={position} rotation={[0, -0.18, 0]}>
          <mesh castShadow position={[0, 0.82, 0]}>
            <boxGeometry args={[0.72, 1.64, 0.42]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.38} metalness={0.12} />
          </mesh>
          <mesh position={[0, 1.16, 0.23]}>
            <boxGeometry args={[0.52, 0.5, 0.035]} />
            <meshStandardMaterial color="#082f49" emissive="#0369a1" emissiveIntensity={0.38} />
          </mesh>
          <Text position={[0, 1.16, 0.255]} fontSize={0.08} color="#bae6fd" anchorX="center">
            KIOSQUE {index + 1}
          </Text>
        </group>
      ))}
    </group>
  );
}

function PassengerCluster() {
  return (
    <group>
      <group position={[3.2, 0, 0.25]} rotation={[0, 2.7, 0]}>
        <Character color="#0f766e" pants="#334155" hair="#3f2a1d" skin="#e7b98a" accessory="scarf" />
      </group>
      <group position={[4.7, 0, 0.15]} rotation={[0, 2.95, 0]}>
        <Character color="#7c3aed" pants="#111827" hair="#0f172a" skin="#f0c7a4" />
      </group>
      <group position={[-4.7, 0, 3.2]} rotation={[0, -0.4, 0]}>
        <Character color="#b45309" pants="#172554" hair="#713f12" skin="#f5d0a9" accessory="backpack" />
      </group>
    </group>
  );
}

function HangingSign({
  children,
  color,
  position,
  size,
}: {
  children: React.ReactNode;
  color: string;
  position: V3;
  size: V3;
}) {
  return (
    <group position={position}>
      <mesh position={[-size[0] / 2 + 0.35, 0.72, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.45, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[size[0] / 2 - 0.35, 0.72, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.45, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} roughness={0.42} />
      </mesh>
      {children}
    </group>
  );
}

function Luggage({ color, position, rotation }: { color: string; position: V3; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.64, 0.78, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.54} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <torusGeometry args={[0.14, 0.018, 8, 16]} />
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.42, 0.2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.2, -0.42, 0.2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.08, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
