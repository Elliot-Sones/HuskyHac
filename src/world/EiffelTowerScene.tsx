import { useMemo, useRef } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BackgroundTraveler } from '@/world/BackgroundTraveler';
import { Character } from '@/world/Character';
import { EIFFEL_TOWER_NPC_POSITION } from '@/world/eiffelTowerLayout';
import type { WorldSceneProps } from '@/world/worldLayout';

const grass = '#8cc88f';
const path = '#dcc9a8';
const gravel = '#eadfc9';
const towerIron = '#7c5a42';
const towerDark = '#4b372c';
const skyBlue = '#bfe5ff';

export function EiffelTowerScene({ mode, isNearNpc, conversationStatus }: WorldSceneProps) {
  const talking = mode === 'conversation' && conversationStatus === 'speaking';

  return (
    <group>
      <hemisphereLight args={[skyBlue, '#6d573b', 0.72]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, -5]} receiveShadow>
        <planeGeometry args={[52, 58]} />
        <meshStandardMaterial color={grass} roughness={0.92} />
      </mesh>

      <ChampDeMarsPaths />
      <EiffelTower />
      <TicketKiosk talking={talking} isNearNpc={isNearNpc} />
      <SouvenirStand />
      <Fountain />
      <GardenBeds />
      <BenchesAndProps />
      <SeinePromenade />
      <EiffelBirds />
      <PlazaPeople />

      <group position={[0, 4.2, 7.3]}>
        <PlazaSign label="Tour Eiffel · Sommet" sublabel="Billets · Ascenseur · Seine" />
      </group>
    </group>
  );
}

function ChampDeMarsPaths() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -4.4]}>
        <planeGeometry args={[10.8, 39]} />
        <meshStandardMaterial color={path} roughness={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 9.3]}>
        <planeGeometry args={[21.5, 4.8]} />
        <meshStandardMaterial color={gravel} roughness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -6.6]}>
        <ringGeometry args={[5.7, 6.35, 72]} />
        <meshStandardMaterial color="#c9ad83" roughness={0.84} />
      </mesh>
      {[-15, -10, -5, 0, 5, 10, 15].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, z]}>
          <planeGeometry args={[9.2, 0.035]} />
          <meshStandardMaterial color="#b99c72" transparent opacity={0.28} roughness={0.7} />
        </mesh>
      ))}
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, -0.3]}
        fontSize={0.52}
        color="#8a5d3b"
        anchorX="center"
      >
        ASCENSEUR →
      </Text>
    </group>
  );
}

function EiffelTower() {
  const crossBars = [-9.4, -7.9, -6.4, -4.9, -3.4];

  return (
    <group position={[0, 0, -7.1]}>
      {[
        [-4.35, -3.8, -0.18],
        [4.35, -3.8, 0.18],
        [-5.7, 3.9, 0.18],
        [5.7, 3.9, -0.18],
      ].map(([x, z, rotation]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
            <boxGeometry args={[0.78, 2.3, 0.78]} />
            <meshStandardMaterial color={towerIron} roughness={0.66} metalness={0.16} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 3.6, 0]} rotation={[0, 0, x < 0 ? -0.13 : 0.13]}>
            <boxGeometry args={[0.34, 5.1, 0.34]} />
            <meshStandardMaterial color={towerDark} roughness={0.62} metalness={0.2} />
          </mesh>
        </group>
      ))}

      <mesh castShadow receiveShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[11.8, 0.44, 8.0]} />
        <meshStandardMaterial color={towerIron} roughness={0.64} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 5.1, -0.15]}>
        <boxGeometry args={[7.2, 0.34, 4.6]} />
        <meshStandardMaterial color={towerIron} roughness={0.64} metalness={0.18} />
      </mesh>

      {crossBars.map((z, index) => (
        <group key={z} position={[0, 3.25 + index * 0.52, z + 7.1]}>
          <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[10.4 - index * 1.2, 0.12, 0.12]} />
            <meshStandardMaterial color="#5f4638" roughness={0.65} metalness={0.18} />
          </mesh>
          <mesh castShadow position={[0, 0.28, 0]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[10.4 - index * 1.2, 0.12, 0.12]} />
            <meshStandardMaterial color="#5f4638" roughness={0.65} metalness={0.18} />
          </mesh>
        </group>
      ))}

      <mesh castShadow position={[0, 7.55, -0.1]}>
        <boxGeometry args={[3.4, 4.8, 2.0]} />
        <meshStandardMaterial color={towerDark} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 10.55, -0.1]}>
        <coneGeometry args={[0.9, 3.0, 4]} />
        <meshStandardMaterial color={towerDark} roughness={0.6} metalness={0.22} />
      </mesh>
      <mesh position={[0, 12.35, -0.1]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function TicketKiosk({ talking, isNearNpc }: { talking: boolean; isNearNpc: boolean }) {
  return (
    <group>
      <group position={[6.05, 0, -1.35]} rotation={[0, -0.14, 0]}>
        <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
          <boxGeometry args={[2.8, 1.5, 1.28]} />
          <meshStandardMaterial color="#f7f1df" roughness={0.78} />
        </mesh>
        <mesh position={[0, 1.38, 0.68]}>
          <boxGeometry args={[2.4, 0.28, 0.1]} />
          <meshStandardMaterial color="#1f3f7a" roughness={0.5} />
        </mesh>
        <Text position={[0, 1.4, 0.75]} fontSize={0.16} color="#f8fafc" anchorX="center">
          BILLETS
        </Text>
        <mesh position={[0, 0.76, 0.69]}>
          <boxGeometry args={[1.55, 0.62, 0.08]} />
          <meshStandardMaterial color="#cde9f5" transparent opacity={0.62} roughness={0.18} />
        </mesh>
      </group>

      <group position={[EIFFEL_TOWER_NPC_POSITION.x, 0, EIFFEL_TOWER_NPC_POSITION.z]} rotation={[0, -2.45, 0]}>
        <Character color="#1f3f7a" pants="#273449" hair="#3b2618" accessory="nametag" talking={talking} />
        <Html position={[0, 2.18, 0]} center distanceFactor={7} wrapperClass="pointer-events-none">
          <div className="airport-nameplate">M. Moreau</div>
        </Html>
      </group>

      {isNearNpc && (
        <Html position={[4.2, 1.92, -0.35]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
          <div className="airport-interact">
            <span>E</span>
            Talk to guide
          </div>
        </Html>
      )}
    </group>
  );
}

function SouvenirStand() {
  return (
    <group position={[-8.7, 0, 1.5]} rotation={[0, 0.22, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.54, 0]}>
        <boxGeometry args={[2.35, 1.08, 1.1]} />
        <meshStandardMaterial color="#9f1239" roughness={0.78} />
      </mesh>
      <mesh castShadow position={[0, 1.26, 0]}>
        <boxGeometry args={[2.75, 0.18, 1.34]} />
        <meshStandardMaterial color="#facc15" roughness={0.55} />
      </mesh>
      <Text position={[0, 1.12, 0.61]} fontSize={0.16} color="#fff7ed" anchorX="center">
        SOUVENIRS
      </Text>
      {[-0.68, 0, 0.68].map((x) => (
        <mesh key={x} castShadow position={[x, 0.92, 0.58]}>
          <coneGeometry args={[0.15, 0.42, 4]} />
          <meshStandardMaterial color="#6b4a32" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Fountain() {
  return (
    <group position={[0, 0, 9.3]}>
      <mesh castShadow receiveShadow position={[0, 0.13, 0]}>
        <boxGeometry args={[6.4, 0.26, 2.2]} />
        <meshStandardMaterial color="#cbbda5" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.7, 1.55]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.25} metalness={0.02} transparent opacity={0.72} />
      </mesh>
      {[-1.8, 0, 1.8].map((x, index) => (
        <group key={x} position={[x, 0.32, 0]}>
          <mesh position={[0, 0.48, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.045, 0.95 + index * 0.1, 8]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.78} />
          </mesh>
          <pointLight position={[0, 0.9, 0]} intensity={0.08} distance={3} color="#bae6fd" />
        </group>
      ))}
    </group>
  );
}

function GardenBeds() {
  return (
    <group>
      {[
        [-14.7, -3.2],
        [14.7, -3.2],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[4.8, 16.4]} />
            <meshStandardMaterial color="#5aa56b" roughness={0.9} />
          </mesh>
          {[-6, -3, 0, 3, 6].map((row) => (
            <mesh key={row} castShadow position={[0.2 * Math.sin(row), 0.18, row]}>
              <sphereGeometry args={[0.42, 8, 6]} />
              <meshStandardMaterial color={row % 2 === 0 ? '#f97316' : '#f9a8d4'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function BenchesAndProps() {
  return (
    <group>
      {[
        [-6.4, 6.4, 0.12],
        [6.4, 6.0, -0.15],
        [-4.6, -15.4, -0.08],
        [4.6, -15.4, 0.08],
      ].map(([x, z, rotation]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]} rotation={[0, rotation, 0]}>
          <mesh castShadow position={[0, 0.38, 0]}>
            <boxGeometry args={[1.9, 0.16, 0.42]} />
            <meshStandardMaterial color="#8b5e34" roughness={0.72} />
          </mesh>
          <mesh castShadow position={[0, 0.72, -0.22]}>
            <boxGeometry args={[1.9, 0.42, 0.12]} />
            <meshStandardMaterial color="#8b5e34" roughness={0.72} />
          </mesh>
        </group>
      ))}
      <group position={[-2.7, 0, 4.8]}>
        <mesh castShadow position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 1.3, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh castShadow position={[0, 1.42, 0]}>
          <boxGeometry args={[0.44, 0.26, 0.18]} />
          <meshStandardMaterial color="#111827" roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

function SeinePromenade() {
  return (
    <group position={[0, 0, -23.5]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[38, 8.2]} />
        <meshStandardMaterial color="#b7a890" roughness={0.84} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -5.8]}>
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#68b6d8" roughness={0.34} metalness={0.04} />
      </mesh>
      {[-15, -12, -9, -6, -3, 3, 6, 9, 12, 15].map((x) => (
        <mesh key={x} castShadow position={[x, 0.7, 1]}>
          <cylinderGeometry args={[0.045, 0.045, 1.25, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.45} metalness={0.2} />
        </mesh>
      ))}
      <Html position={[0, 1.95, -0.5]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className="airport-interact">
          <span>E</span>
          Walk to the Seine
        </div>
      </Html>
    </group>
  );
}

function PlazaSign({ label, sublabel }: { label: string; sublabel: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[5.8, 0.9, 0.18]} />
        <meshStandardMaterial color="#1f3f7a" roughness={0.55} />
      </mesh>
      <Text position={[0, 0.17, 0.105]} fontSize={0.24} color="#f8fafc" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -0.2, 0.105]} fontSize={0.14} color="#dbeafe" anchorX="center">
        {sublabel}
      </Text>
    </group>
  );
}

function PlazaPeople() {
  return (
    <group>
      <BackgroundTraveler start={[-9.2, 0, 7.4]} end={[-3.0, 0, 7.0]} speed={0.36} offset={1.4} color="#0f766e" accessory="suitcase" />
      <BackgroundTraveler start={[7.9, 0, 6.8]} end={[2.4, 0, 3.6]} speed={0.31} offset={3.7} color="#9333ea" accessory="scarf" />
      <BackgroundTraveler start={[-10.8, 0, -13.8]} end={[-3.2, 0, -12.8]} speed={0.42} offset={5.1} color="#f97316" accessory="backpack" />
      <group position={[1.4, 0, 5.5]} rotation={[0, -2.65, 0]}>
        <Character color="#e11d48" pants="#334155" hair="#1f2937" accessory="nametag" />
      </group>
      <group position={[-2.2, 0, 5.0]} rotation={[0, 2.35, 0]}>
        <Character color="#2563eb" pants="#1f2937" hair="#3b2618" accessory="backpack" />
      </group>
    </group>
  );
}

function EiffelBirds() {
  const specs = useMemo(
    () => [
      { seed: 0.0, radius: 12, height: 8.8, land: new THREE.Vector3(-5.6, 0.78, 6.4) },
      { seed: 1.8, radius: 9.4, height: 7.4, land: new THREE.Vector3(6.4, 0.78, 6.0) },
      { seed: 3.4, radius: 14.5, height: 10.1, land: new THREE.Vector3(0.9, 0.46, 9.3) },
      { seed: 5.1, radius: 10.8, height: 6.9, land: new THREE.Vector3(-4.6, 0.78, -15.4) },
      { seed: 6.6, radius: 13.3, height: 9.2, land: new THREE.Vector3(4.6, 0.78, -15.4) },
    ],
    [],
  );

  return (
    <group>
      {specs.map((spec) => (
        <Bird key={spec.seed} {...spec} />
      ))}
    </group>
  );
}

function Bird({
  seed,
  radius,
  height,
  land,
}: {
  seed: number;
  radius: number;
  height: number;
  land: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Group>(null);
  const previous = useRef(new THREE.Vector3());

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const time = state.clock.elapsedTime + seed;
    const cycle = (time % 10) / 10;
    const angle = time * 0.38;
    const flying = new THREE.Vector3(
      Math.cos(angle) * radius,
      height + Math.sin(time * 1.7) * 0.55,
      -3.8 + Math.sin(angle) * radius * 0.58,
    );

    let target = flying;
    let landingAmount = 0;

    if (cycle > 0.58 && cycle < 0.82) {
      landingAmount = smoothstep((cycle - 0.58) / 0.24);
      target = flying.clone().lerp(land, landingAmount);
    } else if (cycle >= 0.82) {
      landingAmount = 1 - smoothstep((cycle - 0.82) / 0.18);
      target = land.clone().lerp(flying, 1 - landingAmount);
    }

    group.position.copy(target);
    const direction = target.clone().sub(previous.current);
    if (direction.lengthSq() > 0.0001) {
      group.rotation.y = Math.atan2(direction.x, direction.z);
    }
    group.rotation.z = Math.sin(time * 2.4) * 0.08 * (1 - landingAmount);
    previous.current.copy(target);

    if (wingRef.current) {
      const flap = landingAmount > 0.9 ? 0.08 : Math.abs(Math.sin(time * 13)) * 0.46 + 0.12;
      wingRef.current.rotation.z = flap;
    }
  });

  return (
    <group ref={groupRef} scale={0.52}>
      <mesh castShadow rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.16, 0.48, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.64} />
      </mesh>
      <group ref={wingRef}>
        <mesh position={[-0.18, 0, 0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[0.42, 0.025, 0.14]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, 0.25]}>
          <boxGeometry args={[0.42, 0.025, 0.14]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}
