import { Html, Text } from '@react-three/drei';
import type { ConversationStatus, SceneMode } from '@/shared/contracts';
import { BackgroundTraveler } from '@/world/BackgroundTraveler';
import { Character } from '@/world/Character';

interface AirportSceneProps {
  mode: SceneMode;
  isNearNpc: boolean;
  conversationStatus: ConversationStatus;
}

const signBlue = '#15236f';
const airportYellow = '#f6d65b';
const floor = '#d8d8d4';

export function AirportScene({ mode, isNearNpc, conversationStatus }: AirportSceneProps) {
  const talking = mode === 'conversation' && conversationStatus === 'speaking';

  return (
    <group>
      <hemisphereLight args={['#dceeff', '#514833', 0.55]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 36]} />
        <meshStandardMaterial color={floor} roughness={0.82} metalness={0.04} />
      </mesh>

      <TerminalWalls />
      <FloorWayfinding />
      <InformationDesk mode={mode} talking={talking} isNearNpc={isNearNpc} />
      <ArrivalBoard />
      <BaggageAndProps />
      <QueueRopes />
      <Kiosks />
      <BackgroundPeople />

      <group position={[0, 4.1, 6.8]}>
        <HangingSign width={6.8} label="← Sortie / Exit · Taxis →" sublabel="RER B · Bus · Correspondances" />
      </group>

      <group position={[-8.5, 3.2, -7.4]} rotation={[0, 0.02, 0]}>
        <HangingSign width={6.6} label="Arrivées · Arrivals" sublabel="Paris Charles de Gaulle · Terminal 2E" />
      </group>
    </group>
  );
}

function TerminalWalls() {
  return (
    <group>
      <mesh position={[0, 3, -10.5]} receiveShadow>
        <boxGeometry args={[44, 6, 0.35]} />
        <meshStandardMaterial color="#e7e1d8" roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.2, -10.25]}>
        <boxGeometry args={[40, 3.4, 0.08]} />
        <meshStandardMaterial color="#dbe8f5" roughness={0.22} metalness={0.02} transparent opacity={0.56} />
      </mesh>

      {[-15, -8, -1, 6, 13].map((x) => (
        <mesh key={x} castShadow position={[x, 3, -10]}>
          <boxGeometry args={[0.32, 6, 0.55]} />
          <meshStandardMaterial color="#c7c0b3" roughness={0.7} />
        </mesh>
      ))}

      {[-16, -8, 0, 8, 16].map((x) => (
        <mesh key={x} position={[x, 5.55, -3.2]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.22, 7.6, 0.22]} />
          <meshStandardMaterial color="#ced4dc" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function FloorWayfinding() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.012, 5.2]}>
        <planeGeometry args={[2.1, 26]} />
        <meshStandardMaterial color="#203da8" roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.018, 5.2]}>
        <planeGeometry args={[0.34, 26]} />
        <meshStandardMaterial color={airportYellow} roughness={0.7} />
      </mesh>
      {[-4, 2.5, 9].map((z) => (
        <Text
          key={z}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-5.2, 0.035, z]}
          fontSize={0.45}
          color="#fff7c2"
          anchorX="center"
          anchorY="middle"
        >
          TAXIS →
        </Text>
      ))}
    </group>
  );
}

function InformationDesk({
  mode,
  talking,
  isNearNpc,
}: {
  mode: SceneMode;
  talking: boolean;
  isNearNpc: boolean;
}) {
  return (
    <group position={[4.7, 0, -4.2]}>
      <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[7.8, 1.24, 1.35]} />
        <meshStandardMaterial color="#15120f" roughness={0.45} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, 1.28, 0]}>
        <boxGeometry args={[8.05, 0.12, 1.58]} />
        <meshStandardMaterial color="#f0efeb" roughness={0.32} metalness={0.18} />
      </mesh>

      <group position={[0, 3.65, 0.02]}>
        <mesh castShadow>
          <boxGeometry args={[5.8, 0.86, 0.16]} />
          <meshStandardMaterial color={signBlue} emissive="#17298d" emissiveIntensity={0.38} />
        </mesh>
        <Text position={[0, 0.1, 0.095]} fontSize={0.48} color="#fff0a1" anchorX="center" anchorY="middle">
          INFORMATION
        </Text>
        <Text position={[0, -0.35, 0.095]} fontSize={0.2} color="#f7d748" anchorX="center" anchorY="middle">
          Renseignements
        </Text>
      </group>

      {[-2.3, 2.3].map((x) => (
        <mesh key={x} position={[x, 4.55, 0.01]}>
          <cylinderGeometry args={[0.035, 0.035, 1.7, 8]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}

      <group position={[0, 1.25, -0.45]} rotation={[0, Math.PI, 0]}>
        <Character color="#1e3a8a" pants="#111827" hair="#8a4a17" accessory="nametag" talking={talking} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -0.35]}>
        <ringGeometry args={[0.95, 1.08, 56]} />
        <meshBasicMaterial color={isNearNpc ? '#34d399' : '#f6d65b'} transparent opacity={0.72} />
      </mesh>

      <Html position={[0, 2.72, 0.25]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="airport-nameplate">
          Mme. Laurent · Information
        </div>
      </Html>

      {mode === 'world' && isNearNpc && (
        <Html position={[0, 2.2, 0.35]} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
          <div className="airport-interact">
            <span>E</span>
            Talk to her
          </div>
        </Html>
      )}
    </group>
  );
}

function ArrivalBoard() {
  const rows = [
    ['AF 077', 'Montreal', '09:15', 'Atterri'],
    ['DL 228', 'New York', '09:42', 'Bagages'],
    ['BA 314', 'London', '10:05', "A l'heure"],
    ['LH 102', 'Munich', '10:20', "A l'heure"],
  ];

  return (
    <group position={[-12.5, 0, -6.4]} rotation={[0, 0.08, 0]}>
      <mesh castShadow position={[0, 2.45, 0]}>
        <boxGeometry args={[6.2, 3.9, 0.2]} />
        <meshStandardMaterial color="#07111f" roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.45, 0.13]}>
        <boxGeometry args={[5.8, 3.45, 0.05]} />
        <meshStandardMaterial color="#0a1740" emissive="#102c88" emissiveIntensity={0.42} roughness={0.36} />
      </mesh>
      <Text position={[0, 3.86, 0.18]} fontSize={0.3} color={airportYellow} anchorX="center">
        ARRIVEES · ARRIVALS
      </Text>
      {rows.map(([flight, from, time, status], index) => {
        const y = 3.18 - index * 0.55;
        return (
          <group key={flight} position={[0, y, 0.2]}>
            <Text position={[-2.65, 0, 0]} fontSize={0.18} color="#fff4b8" anchorX="left">
              {flight}
            </Text>
            <Text position={[-1.45, 0, 0]} fontSize={0.18} color="#d7e7ff" anchorX="left">
              {from}
            </Text>
            <Text position={[0.75, 0, 0]} fontSize={0.18} color="#d7e7ff" anchorX="left">
              {time}
            </Text>
            <Text
              position={[1.72, 0, 0]}
              fontSize={0.17}
              color={status === 'Atterri' ? '#5ee6a8' : '#facc15'}
              anchorX="left"
            >
              {status}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function BaggageAndProps() {
  return (
    <group>
      <group position={[-12.2, 0, 3.2]} rotation={[0, -0.3, 0]}>
        <mesh receiveShadow castShadow position={[0, 0.42, 0]}>
          <boxGeometry args={[4.5, 0.55, 1.4]} />
          <meshStandardMaterial color="#2f3b4a" metalness={0.28} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[4.9, 0.16, 1.65]} />
          <meshStandardMaterial color="#111827" metalness={0.42} roughness={0.38} />
        </mesh>
        {[-1.4, -0.3, 1.2].map((x, i) => (
          <Suitcase key={x} position={[x, 1.05, i % 2 ? 0.16 : -0.1]} color={i === 1 ? '#dc2626' : '#1d4ed8'} />
        ))}
      </group>

      {[
        [-1.4, 0.02, 2.8, '#ef4444'],
        [-0.8, 0.02, 3.25, '#0f766e'],
        [1.6, 0.02, 4.2, '#ca8a04'],
      ].map(([x, y, z, color]) => (
        <Suitcase key={`${x}-${z}`} position={[x as number, y as number, z as number]} color={color as string} />
      ))}
    </group>
  );
}

function Suitcase({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[0.52, 0.68, 0.28]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[0.26, 0.04, 0.04]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
}

function QueueRopes() {
  const posts = [
    [1.2, -1.2],
    [2.7, -1.2],
    [4.2, -1.2],
    [1.2, 0.7],
    [2.7, 0.7],
    [4.2, 0.7],
  ];

  return (
    <group position={[-1.2, 0, -1.2]}>
      {posts.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.045, 0.055, 0.84, 10]} />
            <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.44} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.38} />
          </mesh>
        </group>
      ))}
      {[1.2, 2.7].map((x) => (
        <mesh key={x} position={[x + 0.75, 0.86, -1.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 1.5, 8]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.64} />
        </mesh>
      ))}
      {[1.2, 2.7].map((x) => (
        <mesh key={x} position={[x + 0.75, 0.86, 0.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 1.5, 8]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.64} />
        </mesh>
      ))}
    </group>
  );
}

function Kiosks() {
  return (
    <group position={[9.7, 0, 3.2]} rotation={[0, -0.3, 0]}>
      {[0, 1.2, 2.4].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow position={[0, 0.8, 0]}>
            <boxGeometry args={[0.6, 1.6, 0.36]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
          </mesh>
          <mesh position={[0, 1.05, -0.19]}>
            <boxGeometry args={[0.48, 0.48, 0.04]} />
            <meshStandardMaterial color="#0f172a" emissive="#2563eb" emissiveIntensity={0.36} />
          </mesh>
        </group>
      ))}
      <Text position={[1.2, 2.0, -0.2]} fontSize={0.22} color="#1e3a8a" anchorX="center">
        Billets · Tickets
      </Text>
    </group>
  );
}

function BackgroundPeople() {
  return (
    <group>
      <BackgroundTraveler start={[-12, 0, 6]} end={[-2, 0, 6]} offset={0.2} color="#0f766e" accessory="suitcase" />
      <BackgroundTraveler start={[8, 0, -1]} end={[13, 0, 2.8]} offset={1.7} color="#7c3aed" hair="#111827" accessory="backpack" />
      <group position={[-8.7, 0, 0.2]} rotation={[0, 1.1, 0]}>
        <Character color="#475569" pants="#111827" hair="#facc15" accessory="scarf" />
      </group>
    </group>
  );
}

function HangingSign({
  width,
  label,
  sublabel,
}: {
  width: number;
  label: string;
  sublabel: string;
}) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[width, 0.78, 0.16]} />
        <meshStandardMaterial color={signBlue} emissive="#17298d" emissiveIntensity={0.28} />
      </mesh>
      <Text position={[0, 0.12, 0.1]} fontSize={0.24} color="#fffdf0" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -0.23, 0.1]} fontSize={0.14} color={airportYellow} anchorX="center">
        {sublabel}
      </Text>
    </group>
  );
}
