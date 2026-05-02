import { Html, Text } from '@react-three/drei';
import { Character } from '@/world/Character';
import { COFFEE_SHOP_NPC_POSITION } from '@/world/coffeeShopLayout';
import type { WorldSceneProps } from '@/world/worldLayout';

const floorWood = '#a17249';
const floorPlank = '#8a5d35';
const wallCream = '#f1e1c4';
const wallTrim = '#5a3a23';
const counterTop = '#3a2618';
const counterBody = '#caa46a';
const brassMetal = '#b8884a';
const chromeMetal = '#cdd2d8';
const greenAwning = '#3a6f4f';
const chalkboard = '#1f2a1d';

export function CoffeeShopScene({ mode, isNearNpc, conversationStatus }: WorldSceneProps) {
  const talking = mode === 'conversation' && conversationStatus === 'speaking';

  return (
    <group>
      <hemisphereLight args={['#fff1d6', '#3a2616', 0.78]} />
      <directionalLight position={[6, 8, 4]} intensity={0.55} castShadow />

      <Floor />
      <Walls />
      <Ceiling />
      <Counter talking={talking} isNearNpc={isNearNpc} />
      <Tables />
      <Storefront />
      <PendantLights />
    </group>
  );
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color={floorWood} roughness={0.92} />
      </mesh>
      {[-5.6, -2.8, 0, 2.8, 5.6].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, z]}>
          <planeGeometry args={[15.2, 0.05]} />
          <meshStandardMaterial color={floorPlank} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 1.6, -6.55]} receiveShadow>
        <boxGeometry args={[15.2, 3.2, 0.18]} />
        <meshStandardMaterial color={wallCream} roughness={0.86} />
      </mesh>
      <mesh position={[-7.55, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.2, 13.2]} />
        <meshStandardMaterial color={wallCream} roughness={0.86} />
      </mesh>
      <mesh position={[7.55, 1.6, 0]} receiveShadow>
        <boxGeometry args={[0.18, 3.2, 13.2]} />
        <meshStandardMaterial color={wallCream} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.34, -6.45]}>
        <boxGeometry args={[15.0, 0.68, 0.06]} />
        <meshStandardMaterial color={wallTrim} roughness={0.78} />
      </mesh>
      <Chalkboard />
    </group>
  );
}

function Chalkboard() {
  return (
    <group position={[-3.0, 2.1, -6.36]}>
      <mesh castShadow>
        <boxGeometry args={[3.4, 1.55, 0.08]} />
        <meshStandardMaterial color={wallTrim} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[3.1, 1.3, 0.02]} />
        <meshStandardMaterial color={chalkboard} roughness={0.78} />
      </mesh>
      <Text position={[0, 0.42, 0.06]} fontSize={0.18} color="#fef9c3" anchorX="center">
        CAFÉ BISSET
      </Text>
      <Text position={[-1.05, 0.04, 0.06]} fontSize={0.13} color="#fef9c3" anchorX="left">
        Café         2.50
      </Text>
      <Text position={[-1.05, -0.18, 0.06]} fontSize={0.13} color="#fef9c3" anchorX="left">
        Café au lait 3.50
      </Text>
      <Text position={[-1.05, -0.4, 0.06]} fontSize={0.13} color="#fef9c3" anchorX="left">
        Cappuccino   3.80
      </Text>
      <Text position={[-1.05, -0.55, 0.06]} fontSize={0.11} color="#bef264" anchorX="left">
        Croissant · Pain au chocolat · Tarte
      </Text>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh position={[0, 3.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[15.0, 13.0]} />
      <meshStandardMaterial color="#fbf3df" roughness={0.92} />
    </mesh>
  );
}

function Counter({ talking, isNearNpc }: { talking: boolean; isNearNpc: boolean }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.52, -3.0]}>
        <boxGeometry args={[9.0, 1.04, 1.2]} />
        <meshStandardMaterial color={counterBody} roughness={0.66} />
      </mesh>
      <mesh castShadow position={[0, 1.07, -3.0]}>
        <boxGeometry args={[9.05, 0.08, 1.26]} />
        <meshStandardMaterial color={counterTop} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.18, -2.46]}>
        <boxGeometry args={[8.8, 0.32, 0.08]} />
        <meshStandardMaterial color={brassMetal} roughness={0.42} metalness={0.7} />
      </mesh>

      <EspressoMachine position={[-1.5, 1.11, -3.4]} />
      <PastryCase position={[3.0, 1.12, -3.0]} />
      <CashRegister position={[-3.6, 1.11, -3.0]} />

      <group position={[COFFEE_SHOP_NPC_POSITION.x, 0, COFFEE_SHOP_NPC_POSITION.z]}>
        <Character
          color="#0f766e"
          pants="#1f2937"
          hair="#3b2618"
          accessory="nametag"
          talking={talking}
        />
        <Html position={[0, 2.18, 0]} center distanceFactor={7} wrapperClass="pointer-events-none">
          <div className="airport-nameplate">Léa Martin</div>
        </Html>
      </group>

      {isNearNpc && (
        <Html position={[0, 1.85, -2.0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="airport-interact">
            <span>E</span>
            Order a coffee
          </div>
        </Html>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -2.0]}>
        <ringGeometry args={[0.95, 1.08, 56]} />
        <meshBasicMaterial color={isNearNpc ? '#34d399' : '#f6d65b'} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function EspressoMachine({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[1.6, 0.64, 0.62]} />
        <meshStandardMaterial color={chromeMetal} roughness={0.32} metalness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.42]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.78, -0.08]}>
        <boxGeometry args={[0.72, 0.22, 0.18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <Text position={[0, 0.78, 0.02]} fontSize={0.06} color="#fef3c7" anchorX="center">
        BEZZERA
      </Text>
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} castShadow position={[x, 0.02, 0.32]}>
          <cylinderGeometry args={[0.06, 0.07, 0.18, 14]} />
          <meshStandardMaterial color={brassMetal} roughness={0.32} metalness={0.78} />
        </mesh>
      ))}
      <mesh position={[0.78, 0.4, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.26, 10]} />
        <meshStandardMaterial color={chromeMetal} roughness={0.28} metalness={0.72} />
      </mesh>
    </group>
  );
}

function PastryCase({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.7, 0.44, 0.74]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.4} roughness={0.18} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.7, 0.06, 0.74]} />
        <meshStandardMaterial color={counterTop} roughness={0.55} />
      </mesh>
      <mesh position={[-0.5, 0.18, 0]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.18]} />
        <meshStandardMaterial color="#f4c474" roughness={0.78} />
      </mesh>
      <mesh position={[-0.05, 0.18, 0]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.18]} />
        <meshStandardMaterial color="#d97a45" roughness={0.78} />
      </mesh>
      <mesh position={[0.4, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.14, 16]} />
        <meshStandardMaterial color="#a8631d" roughness={0.7} />
      </mesh>
    </group>
  );
}

function CashRegister({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.62, 0.36, 0.5]} />
        <meshStandardMaterial color="#1f2937" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.4, -0.18]}>
        <boxGeometry args={[0.38, 0.18, 0.06]} />
        <meshStandardMaterial color="#06283d" roughness={0.5} emissive="#06283d" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 0.4, -0.14]} fontSize={0.06} color="#67e8f9" anchorX="center">
        3,50 €
      </Text>
    </group>
  );
}

function Tables() {
  return (
    <group>
      {[
        [-3.6, 1.4],
        [3.6, 1.4],
        [-3.6, 4.2],
        [3.6, 4.2],
      ].map(([x, z], index) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.78, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.06, 24]} />
            <meshStandardMaterial color="#3f2a18" roughness={0.55} />
          </mesh>
          <mesh castShadow position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 0.78, 10]} />
            <meshStandardMaterial color="#1f1610" roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.36, 0.42, 0.06, 18]} />
            <meshStandardMaterial color="#1f1610" roughness={0.55} />
          </mesh>
          <Chair position={[0, 0, 0.95]} rotation={Math.PI} />
          <Chair position={[0, 0, -0.95]} rotation={0} />
          {index === 0 && <CoffeeMug position={[-0.18, 0.84, 0]} color="#f8fafc" liquid="#3a2417" />}
          {index === 1 && (
            <>
              <CoffeeMug position={[-0.16, 0.84, -0.1]} color="#fde68a" liquid="#5a3920" />
              <CoffeeMug position={[0.18, 0.84, 0.12]} color="#f1f5f9" liquid="#caa15a" />
            </>
          )}
          {index === 2 && <CoffeeMug position={[0, 0.84, 0]} color="#fef3c7" liquid="#3a2417" />}
        </group>
      ))}
    </group>
  );
}

function Chair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[0.48, 0.06, 0.42]} />
        <meshStandardMaterial color="#5b3a22" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.78, -0.18]}>
        <boxGeometry args={[0.46, 0.62, 0.05]} />
        <meshStandardMaterial color="#4d3018" roughness={0.7} />
      </mesh>
      {[
        [-0.2, -0.18],
        [0.2, -0.18],
        [-0.2, 0.18],
        [0.2, 0.18],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} castShadow position={[lx, 0.21, lz]}>
          <boxGeometry args={[0.05, 0.42, 0.05]} />
          <meshStandardMaterial color="#3d2515" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeMug({
  position,
  color,
  liquid,
}: {
  position: [number, number, number];
  color: string;
  liquid: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.06, 0.13, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.058, 0.02, 16]} />
        <meshStandardMaterial color={liquid} roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
    </group>
  );
}

function Storefront() {
  return (
    <group position={[0, 0, 6.45]}>
      <mesh position={[-4.4, 1.6, 0]} receiveShadow>
        <boxGeometry args={[6.0, 3.2, 0.16]} />
        <meshStandardMaterial color={wallCream} roughness={0.86} />
      </mesh>
      <mesh position={[4.4, 1.6, 0]} receiveShadow>
        <boxGeometry args={[6.0, 3.2, 0.16]} />
        <meshStandardMaterial color={wallCream} roughness={0.86} />
      </mesh>
      <mesh position={[-4.4, 1.6, 0.02]}>
        <boxGeometry args={[5.2, 2.0, 0.04]} />
        <meshStandardMaterial color="#cde9f5" transparent opacity={0.42} roughness={0.18} />
      </mesh>
      <mesh position={[4.4, 1.6, 0.02]}>
        <boxGeometry args={[5.2, 2.0, 0.04]} />
        <meshStandardMaterial color="#cde9f5" transparent opacity={0.42} roughness={0.18} />
      </mesh>

      <group position={[0, 2.42, -0.04]}>
        <mesh castShadow>
          <boxGeometry args={[3.0, 0.7, 0.18]} />
          <meshStandardMaterial color={greenAwning} roughness={0.6} />
        </mesh>
        <Text position={[0, 0.05, 0.1]} fontSize={0.22} color="#fef9c3" anchorX="center">
          CAFÉ BISSET
        </Text>
        <Text position={[0, -0.16, 0.1]} fontSize={0.1} color="#fef9c3" anchorX="center">
          Espresso · Pâtisseries · Le Marais
        </Text>
      </group>

      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.3, 2.2, 0.08]} />
        <meshStandardMaterial color="#3b2618" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.45, 0.05]}>
        <boxGeometry args={[1.0, 1.2, 0.04]} />
        <meshStandardMaterial color="#cde9f5" transparent opacity={0.55} roughness={0.18} />
      </mesh>
      <mesh position={[0.5, 1.1, 0.05]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color={brassMetal} roughness={0.32} metalness={0.78} />
      </mesh>
    </group>
  );
}

function PendantLights() {
  const positions: [number, number, number][] = [
    [-3.6, 0, 1.4],
    [3.6, 0, 1.4],
    [-3.6, 0, 4.2],
    [3.6, 0, 4.2],
    [0, 0, -3.0],
  ];
  return (
    <group>
      {positions.map(([x, , z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 3.0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh castShadow position={[0, 2.55, 0]}>
            <coneGeometry args={[0.18, 0.32, 18, 1, true]} />
            <meshStandardMaterial color="#1f2937" roughness={0.55} side={2} />
          </mesh>
          <mesh position={[0, 2.42, 0]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color="#fff7c5" emissive="#fff0a5" emissiveIntensity={0.95} />
          </mesh>
          <pointLight position={[0, 2.42, 0]} intensity={0.42} distance={5.0} color="#fff5d2" />
        </group>
      ))}
    </group>
  );
}
