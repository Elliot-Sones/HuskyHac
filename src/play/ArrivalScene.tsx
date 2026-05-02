import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import type { PlayDestination } from '@/play/destinations';

const ARRIVAL_DURATION = 5.6;
const FOG_COLOR = '#d6e2ee';
const TOUCHDOWN_T = 0.55;

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return 1 - Math.pow(1 - t, 3);
}

interface ArrivalSceneProps {
  destination: PlayDestination;
}

export function ArrivalScene({ destination }: ArrivalSceneProps) {
  const showEiffel = useMemo(() => {
    const country = destination.scenario.destination
      .split(',')
      .at(-1)
      ?.trim()
      .toLowerCase();
    return country?.includes('france') ?? false;
  }, [destination]);

  return (
    <>
      <fog attach="fog" args={[FOG_COLOR, 32, 120]} />

      <Sky
        distance={450000}
        sunPosition={[-60, 14, -140]}
        rayleigh={2.6}
        turbidity={6.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.86}
      />

      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[-22, 26, -16]}
        intensity={1.1}
        color="#fff2d6"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={['#cfe6ff', '#7e8d6f', 0.4]} />

      <Ground />
      <Runway />
      <Skyline showEiffel={showEiffel} />
      <Plane />
      <CameraRig />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#7ea36a" roughness={0.95} />
    </mesh>
  );
}

function Runway() {
  const dashes = useMemo(() => {
    const items: number[] = [];
    for (let i = 0; i < 22; i++) items.push(15 - i * 6);
    return items;
  }, []);

  const lights = useMemo(() => {
    const items: { x: number; z: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const z = 14 - i * 8;
      items.push({ x: -7.6, z });
      items.push({ x: 7.6, z });
    }
    return items;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -40]} receiveShadow>
        <planeGeometry args={[16, 200]} />
        <meshStandardMaterial color="#2c333a" roughness={0.92} />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`th-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-4.9 + i * 1.4, 0.012, 13]}
        >
          <planeGeometry args={[0.55, 4]} />
          <meshStandardMaterial color="#f5f7f9" />
        </mesh>
      ))}

      {dashes.map((z, i) => (
        <mesh
          key={`cl-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.014, z]}
        >
          <planeGeometry args={[0.42, 2.2]} />
          <meshStandardMaterial color="#f5f7f9" />
        </mesh>
      ))}

      {lights.map((l, i) => (
        <RunwayLight key={`lt-${i}`} x={l.x} z={l.z} index={i} />
      ))}
    </group>
  );
}

function RunwayLight({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 3.4 + index * 0.7) * 0.3;
    (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
  });
  return (
    <mesh ref={ref} position={[x, 0.18, z]}>
      <sphereGeometry args={[0.16, 12, 12]} />
      <meshStandardMaterial
        color="#fff7d6"
        emissive="#ffd874"
        emissiveIntensity={0.8}
        toneMapped={false}
      />
    </mesh>
  );
}

function Skyline({ showEiffel }: { showEiffel: boolean }) {
  const buildings = useMemo(() => {
    const items: { x: number; w: number; h: number; d: number; tone: number }[] = [];
    for (let i = 0; i < 14; i++) {
      items.push({
        x: -60 + i * 9 + (i % 2 === 0 ? -1.2 : 1.5),
        w: 4 + ((i * 13) % 4) * 1.1,
        h: 4 + ((i * 17) % 7),
        d: 4 + ((i * 7) % 3),
        tone: i % 2,
      });
    }
    return items;
  }, []);

  return (
    <group position={[0, 0, -78]}>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.tone === 0 ? '#7e92aa' : '#92a4b8'}
            roughness={0.85}
          />
        </mesh>
      ))}
      {showEiffel && <EiffelSilhouette position={[12, 0, 4]} />}
    </group>
  );
}

function EiffelSilhouette({ position }: { position: [number, number, number] }) {
  const tone = '#5b6b78';
  const legs: [number, number][] = [
    [+1.7, +1.7],
    [-1.7, +1.7],
    [+1.7, -1.7],
    [-1.7, -1.7],
  ];
  return (
    <group position={position}>
      {legs.map(([lx, lz], i) => {
        const tilt = 0.18;
        return (
          <mesh
            key={i}
            position={[lx * 0.55, 4.6, lz * 0.55]}
            rotation={[Math.sign(lz) * tilt, 0, -Math.sign(lx) * tilt]}
            castShadow
          >
            <cylinderGeometry args={[0.2, 0.36, 9.4, 6]} />
            <meshStandardMaterial color={tone} roughness={0.9} />
          </mesh>
        );
      })}
      <mesh position={[0, 4.5, 0]} castShadow>
        <boxGeometry args={[3.3, 0.4, 3.3]} />
        <meshStandardMaterial color={tone} />
      </mesh>
      <mesh position={[0, 7.1, 0]} castShadow>
        <boxGeometry args={[1.6, 2.6, 1.6]} />
        <meshStandardMaterial color={tone} />
      </mesh>
      <mesh position={[0, 9.0, 0]} castShadow>
        <boxGeometry args={[1.0, 0.3, 1.0]} />
        <meshStandardMaterial color={tone} />
      </mesh>
      <mesh position={[0, 11.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.46, 4.6, 6]} />
        <meshStandardMaterial color={tone} />
      </mesh>
      <mesh position={[0, 14.1, 0]} castShadow>
        <coneGeometry args={[0.12, 0.7, 6]} />
        <meshStandardMaterial color={tone} />
      </mesh>
    </group>
  );
}

function Plane() {
  const groupRef = useRef<THREE.Group>(null);
  const dustLeftRef = useRef<THREE.Mesh>(null);
  const dustRightRef = useRef<THREE.Mesh>(null);
  const startRef = useRef<number | null>(null);
  const touchdownPos = useMemo(() => new THREE.Vector3(0, 0.6, -2), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const t = Math.min(elapsed / ARRIVAL_DURATION, 1);

    const start = new THREE.Vector3(-13, 13, 30);
    const exit = new THREE.Vector3(0, 0.6, -58);

    let pos: THREE.Vector3;
    let pitch: number;
    let roll: number;
    if (t < TOUCHDOWN_T) {
      const k = easeOutCubic(t / TOUCHDOWN_T);
      pos = start.clone().lerp(touchdownPos, k);
      pitch = 0.11 * (1 - k);
      roll = -0.07 * (1 - k);
    } else {
      const k = (t - TOUCHDOWN_T) / (1 - TOUCHDOWN_T);
      pos = touchdownPos.clone().lerp(exit, k);
      pitch = 0;
      roll = 0;
    }
    group.position.copy(pos);
    group.rotation.set(pitch, 0, roll);

    const dustStart = TOUCHDOWN_T;
    const dustEnd = 0.92;
    if (dustLeftRef.current && dustRightRef.current) {
      const amt = t > dustStart ? Math.min((t - dustStart) / (dustEnd - dustStart), 1) : 0;
      const scale = 0.4 + amt * 1.8;
      const opacity = amt < 0.4 ? amt * 1.7 : (1 - amt) * 1.0;
      const set = (mesh: THREE.Mesh) => {
        mesh.scale.set(scale, scale, scale);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, opacity);
      };
      set(dustLeftRef.current);
      set(dustRightRef.current);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        <PlaneMesh />
      </group>
      <mesh
        ref={dustLeftRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[touchdownPos.x - 1.0, 0.025, touchdownPos.z + 0.4]}
      >
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial color="#f0eadf" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh
        ref={dustRightRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[touchdownPos.x + 1.0, 0.025, touchdownPos.z + 0.4]}
      >
        <circleGeometry args={[1.1, 24]} />
        <meshBasicMaterial color="#f0eadf" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

function PlaneMesh() {
  const body = '#f4f7fb';
  const accent = '#1b3b6f';
  const windowStripe = '#0f2944';

  return (
    <group>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 4.2, 24]} />
        <meshStandardMaterial color={body} roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0, -2.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 1.0, 24]} />
        <meshStandardMaterial color={body} roughness={0.4} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0, 2.45]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.5, 0.8, 24]} />
        <meshStandardMaterial color={body} roughness={0.4} metalness={0.12} />
      </mesh>

      {[-1, 1].map((s) => (
        <mesh key={`stripe-${s}`} position={[0.502 * s, 0.05, 0]} rotation={[0, (Math.PI / 2) * s, 0]}>
          <planeGeometry args={[3.5, 0.18]} />
          <meshStandardMaterial color={accent} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`win-${s}`} position={[0.502 * s, 0.2, 0]} rotation={[0, (Math.PI / 2) * s, 0]}>
          <planeGeometry args={[3.0, 0.13]} />
          <meshStandardMaterial color={windowStripe} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <mesh position={[0, 0.34, -1.85]} rotation={[0.45, 0, 0]}>
        <sphereGeometry args={[0.34, 16, 12, 0, Math.PI]} />
        <meshStandardMaterial color="#0f2944" roughness={0.18} metalness={0.3} />
      </mesh>

      <mesh castShadow position={[0, -0.05, 0.2]}>
        <boxGeometry args={[6.4, 0.1, 1.55]} />
        <meshStandardMaterial color="#e4ebf3" />
      </mesh>
      <mesh castShadow position={[0, 0.55, 2.05]}>
        <boxGeometry args={[2.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#e4ebf3" />
      </mesh>
      <mesh castShadow position={[0, 0.7, 2.2]}>
        <boxGeometry args={[0.08, 1.1, 0.9]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {[-1.7, 1.7].map((x) => (
        <group key={`eng-${x}`} position={[x, -0.32, 0.3]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
            <meshStandardMaterial color="#1f2a36" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, -0.46]}>
            <torusGeometry args={[0.22, 0.04, 8, 20]} />
            <meshStandardMaterial color="#0a1018" />
          </mesh>
        </group>
      ))}

      <Gear position={[0, -0.5, -1.4]} />
      <Gear position={[-1.05, -0.5, 0.35]} />
      <Gear position={[1.05, -0.5, 0.35]} />
    </group>
  );
}

function Gear({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#3a4654" />
      </mesh>
      <mesh castShadow position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.16, 16]} />
        <meshStandardMaterial color="#0e1419" />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();
  const startRef = useRef<number | null>(null);
  const lookTargetRef = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const t = Math.min(elapsed / ARRIVAL_DURATION, 1);

    const camStart = new THREE.Vector3(12, 4.6, 15);
    const camTouch = new THREE.Vector3(7.4, 1.7, 10);
    const camEnd = new THREE.Vector3(5.4, 1.1, 7.5);
    const lookStart = new THREE.Vector3(-2, 6, 10);
    const lookTouch = new THREE.Vector3(0, 0.7, -3);
    const lookEnd = new THREE.Vector3(0, 0.6, -28);

    let pos: THREE.Vector3;
    let look: THREE.Vector3;
    if (t < TOUCHDOWN_T) {
      const k = smoothstep(t / TOUCHDOWN_T);
      pos = camStart.clone().lerp(camTouch, k);
      look = lookStart.clone().lerp(lookTouch, k);
    } else {
      const k = smoothstep((t - TOUCHDOWN_T) / (1 - TOUCHDOWN_T));
      pos = camTouch.clone().lerp(camEnd, k);
      look = lookTouch.clone().lerp(lookEnd, k);
    }
    camera.position.copy(pos);
    lookTargetRef.current.copy(look);
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}
