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
const glass = '#cfe1ee';
const wallPanel = '#ded8cf';
const metal = '#64748b';

export function AirportScene({ mode, isNearNpc, conversationStatus }: AirportSceneProps) {
  const talking = mode === 'conversation' && conversationStatus === 'speaking';

  return (
    <group>
      <hemisphereLight args={['#dceeff', '#514833', 0.55]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, -2]} receiveShadow>
        <planeGeometry args={[44, 40]} />
        <meshStandardMaterial color={floor} roughness={0.82} metalness={0.04} />
      </mesh>
      <FloorTiles />

      <TerminalWalls />
      <RearTaxiExterior />
      <FloorWayfinding />
      <InformationDesk mode={mode} talking={talking} isNearNpc={isNearNpc} />
      <ArrivalBoard />
      <BaggageAndProps />
      <QueueRopes />
      <Kiosks />
      <BackgroundPeople />

      <group position={[0, 4.1, 6.8]}>
        <HangingSign width={6.8} label="Sortie · Exit · Taxis →" sublabel="RER B · Bus · Correspondances" />
      </group>

      <group position={[-8.5, 3.2, -7.4]} rotation={[0, 0.02, 0]}>
        <HangingSign width={6.6} label="Arrivées · Arrivals" sublabel="Paris Charles de Gaulle · Terminal 2E" />
      </group>
    </group>
  );
}

function FloorTiles() {
  const horizontalLines = Array.from({ length: 17 }, (_, index) => -18 + index * 2);
  const verticalLines = Array.from({ length: 17 }, (_, index) => -16 + index * 2);

  return (
    <group>
      {horizontalLines.map((z) => (
        <mesh key={`z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, z]}>
          <planeGeometry args={[32, 0.026]} />
          <meshStandardMaterial color="#c8c2b6" transparent opacity={0.34} roughness={0.8} />
        </mesh>
      ))}
      {verticalLines.map((x) => (
        <mesh key={`x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.007, -2]}>
          <planeGeometry args={[0.026, 32]} />
          <meshStandardMaterial color="#c8c2b6" transparent opacity={0.28} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function TerminalWalls() {
  return (
    <group>
      {[
        [-11.8, 8.6],
        [5.6, 17],
      ].map(([x, width]) => (
        <group key={x} position={[x, 0, -10.5]}>
          <mesh position={[0, 3, 0]} receiveShadow>
            <boxGeometry args={[width, 6, 0.35]} />
            <meshStandardMaterial color={wallPanel} roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.2, 0.25]}>
            <boxGeometry args={[width * 0.92, 3.4, 0.08]} />
            <meshStandardMaterial color={glass} roughness={0.16} metalness={0.02} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      {[-15, -8, -1, 6, 13].map((x) => (
        <mesh key={x} castShadow position={[x, 3, -10]}>
          <boxGeometry args={[0.32, 6, 0.55]} />
          <meshStandardMaterial color="#c7c0b3" roughness={0.7} />
        </mesh>
      ))}

      <SideWall side="left" x={-16.1} />
      <SideWall side="right" x={14.1} />
      <RearTaxiDoor />

      {[-16, -8, 0, 8, 16].map((x) => (
        <mesh key={x} position={[x, 5.55, -3.2]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.22, 7.6, 0.22]} />
          <meshStandardMaterial color="#ced4dc" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function SideWall({ side, x }: { side: 'left' | 'right'; x: number }) {
  const rotationY = side === 'left' ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group position={[x, 0, 1]} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[23.6, 2.3, 0.28]} />
        <meshStandardMaterial color="#d5d0c6" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.45, 0.02]}>
        <boxGeometry args={[22.6, 3.0, 0.09]} />
        <meshStandardMaterial color={glass} roughness={0.12} metalness={0.04} transparent opacity={0.47} />
      </mesh>
      {[-9, -4.5, 0, 4.5, 9].map((z) => (
        <mesh key={z} castShadow position={[z, 3.15, 0.12]}>
          <boxGeometry args={[0.18, 5.25, 0.2]} />
          <meshStandardMaterial color="#a8b0ba" roughness={0.44} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function RearTaxiDoor() {
  return (
    <group position={[-5.2, 0, -10.35]}>
      <mesh castShadow position={[0, 4.35, 0]}>
        <boxGeometry args={[5.8, 0.52, 0.42]} />
        <meshStandardMaterial color="#cac3b6" roughness={0.76} />
      </mesh>
      <mesh position={[0, 2.2, 0.06]}>
        <boxGeometry args={[5.3, 3.65, 0.08]} />
        <meshStandardMaterial color="#d8edf8" transparent opacity={0.28} roughness={0.1} />
      </mesh>
      <group position={[0, 3.75, 0.16]}>
        <HangingSign width={4.9} label="SORTIE · TAXIS" sublabel="Taxi pickup outside" />
      </group>

      {[-2.9, 2.9].map((x) => (
        <mesh key={x} castShadow position={[x, 2.1, 0.08]}>
          <boxGeometry args={[0.16, 4.2, 0.28]} />
          <meshStandardMaterial color={metal} roughness={0.45} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function FloorWayfinding() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.012, 6.4]}>
        <planeGeometry args={[2.1, 34]} />
        <meshStandardMaterial color="#203da8" roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.018, 6.4]}>
        <planeGeometry args={[0.34, 34]} />
        <meshStandardMaterial color={airportYellow} roughness={0.7} />
      </mesh>
      {[-5, 2.5, 9.8, 16.4].map((z) => (
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

function RearTaxiExterior() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.005, -13.7]}>
        <planeGeometry args={[12, 4.8]} />
        <meshStandardMaterial color="#c8c3b7" roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.005, -27.5]}>
        <planeGeometry args={[13.5, 5.4]} />
        <meshStandardMaterial color="#c8c3b7" roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.018, -21.1]}>
        <planeGeometry args={[13.5, 10.4]} />
        <meshStandardMaterial color="#34383f" roughness={0.74} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.2, 0.04, -12.0]}>
        <planeGeometry args={[5.3, 2.6]} />
        <meshStandardMaterial color="#eef5f6" roughness={0.54} />
      </mesh>
      <mesh castShadow receiveShadow position={[-5.2, 0.18, -14.8]}>
        <boxGeometry args={[7.8, 0.32, 0.34]} />
        <meshStandardMaterial color="#e7c84d" roughness={0.58} />
      </mesh>
      <mesh castShadow receiveShadow position={[-5.2, 0.18, -24.8]}>
        <boxGeometry args={[8.6, 0.32, 0.34]} />
        <meshStandardMaterial color="#e7c84d" roughness={0.58} />
      </mesh>

      {[-8.0, -1.9].map((x) => (
        <Taxi key={x} position={[x, 0.02, -16.8]} />
      ))}

      <group position={[-5.2, 1.95, -13.2]}>
        <HangingSign width={5.3} label="TAXI PICKUP" sublabel="Prise en charge taxi" />
      </group>
      <TransitPrompt position={[-5.2, 1.95, -16.8]} label="Enter taxi" />

      {[-7.5, -4.9, -2.3].map((x) => (
        <mesh key={x} position={[x, 0.055, -18.7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 0.12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
      ))}

      {[-23.6, -22.4, -21.2, -20.0, -18.8].map((z) => (
        <mesh key={z} position={[-5.2, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 0.22]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.46} />
        </mesh>
      ))}
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-2.4, 0.07, -21.25]}
        fontSize={0.36}
        color="#f8fafc"
        anchorX="center"
      >
        BUS →
      </Text>

      <Bus position={[-9.2, 0.04, -29.2]} />
      <BusShelter position={[-1.9, 0, -29.2]} />
      <TransitPrompt position={[-5.2, 1.95, -28.5]} label="Board bus" />

      <group position={[-5.2, 1.95, -26.1]}>
        <HangingSign width={5.1} label="BUS 350 · PARIS" sublabel="Arret bus · Central Paris" />
      </group>

      {[-11.2, 0.7].map((x) => (
        <StreetLight key={x} position={[x, 0, -22.8]} />
      ))}
      <CityBackdrop />
    </group>
  );
}

function TransitPrompt({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <Html position={position} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
      <div className="airport-interact">
        <span>E</span>
        {label}
      </div>
    </Html>
  );
}

function Bus({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[5.1, 1.25, 1.5]} />
        <meshStandardMaterial color="#2f6edb" roughness={0.44} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.07, -0.78]}>
        <boxGeometry args={[4.55, 0.42, 0.08]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.22} metalness={0.04} />
      </mesh>
      <mesh position={[-1.75, 1.45, -0.82]}>
        <boxGeometry args={[1.1, 0.18, 0.08]} />
        <meshStandardMaterial color="#07111f" emissive="#07111f" emissiveIntensity={0.25} />
      </mesh>
      <Text position={[-1.75, 1.46, -0.88]} fontSize={0.16} color="#fde68a" anchorX="center">
        350 PARIS
      </Text>
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} castShadow position={[x, 0.2, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.16, 18]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function BusShelter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.08, 0]}>
      <mesh castShadow position={[0, 1.75, 0]}>
        <boxGeometry args={[1.75, 0.14, 0.88]} />
        <meshStandardMaterial color="#111827" roughness={0.34} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.96, 0.4]}>
        <boxGeometry args={[1.55, 1.45, 0.06]} />
        <meshStandardMaterial color={glass} roughness={0.1} transparent opacity={0.42} />
      </mesh>
      <mesh castShadow position={[0, 0.24, -0.18]}>
        <boxGeometry args={[1.28, 0.22, 0.46]} />
        <meshStandardMaterial color="#2f3b4a" roughness={0.48} />
      </mesh>
      {[-0.74, 0.74].map((x) => (
        <mesh key={x} castShadow position={[x, 0.85, 0.42]}>
          <cylinderGeometry args={[0.035, 0.035, 1.65, 8]} />
          <meshStandardMaterial color={metal} roughness={0.42} metalness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 3.4, 10]} />
        <meshStandardMaterial color="#475569" roughness={0.46} metalness={0.24} />
      </mesh>
      <mesh castShadow position={[0.38, 3.35, 0]}>
        <boxGeometry args={[0.76, 0.08, 0.08]} />
        <meshStandardMaterial color="#475569" roughness={0.46} metalness={0.24} />
      </mesh>
      <pointLight position={[0.78, 3.12, 0]} intensity={0.35} distance={7} color="#fff7d1" />
      <mesh position={[0.78, 3.12, 0]}>
        <sphereGeometry args={[0.13, 12, 8]} />
        <meshStandardMaterial color="#fff7d1" emissive="#fff7d1" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function CityBackdrop() {
  return (
    <group position={[-5.2, 0, -37]}>
      {[
        [-5.5, 0.85, 1.6],
        [-2.8, 1.2, 1.9],
        [0.1, 1.05, 1.35],
        [2.5, 1.35, 1.7],
      ].map(([x, height, width]) => (
        <mesh key={x} position={[x, height / 2, 0]}>
          <boxGeometry args={[width, height, 0.55]} />
          <meshStandardMaterial color="#cbd5df" roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function Taxi({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.55, 0.72, 3.0]} />
        <meshStandardMaterial color="#f2c230" roughness={0.48} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0, 0.92, -0.15]}>
        <boxGeometry args={[1.25, 0.55, 1.3]} />
        <meshStandardMaterial color="#f6d65b" roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.23, -0.12]}>
        <boxGeometry args={[0.82, 0.16, 0.48]} />
        <meshStandardMaterial color="#102a5c" emissive="#102a5c" emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 1.25, -0.41]} rotation={[0, 0, 0]} fontSize={0.16} color="#fff7bf" anchorX="center">
        TAXI
      </Text>
      {[-0.65, 0.65].flatMap((x) =>
        [-0.95, 0.95].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.52} />
          </mesh>
        )),
      )}
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
