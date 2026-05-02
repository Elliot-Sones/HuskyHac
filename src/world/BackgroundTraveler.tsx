import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character, type CharacterAccessory } from './Character';

type Vec3Tuple = [number, number, number];

export interface BackgroundTravelerProps {
  start?: Vec3Tuple;
  end?: Vec3Tuple;
  speed?: number;
  offset?: number;
  scale?: number;
  color?: string;
  skin?: string;
  pants?: string;
  hair?: string;
  accessory?: CharacterAccessory;
}

export function BackgroundTraveler({
  start = [-4, 0, -2],
  end = [4, 0, -2],
  speed = 0.45,
  offset = 0,
  scale = 1,
  color = '#0f766e',
  skin = '#eec0a2',
  pants = '#334155',
  hair = '#2b1710',
  accessory = 'suitcase',
}: BackgroundTravelerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const path = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const delta = to.clone().sub(from);
    const distance = Math.max(delta.length(), 0.001);
    const headingForward = Math.atan2(delta.x, delta.z);
    const headingBack = headingForward + Math.PI;

    return { from, to, distance, headingForward, headingBack };
  }, [end, start]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const paceSpeed = Math.max(speed, 0.05);
    const cycle = path.distance / paceSpeed;
    const normalized = ((state.clock.elapsedTime + offset) / cycle) % 2;
    const returning = normalized > 1;
    const progress = returning ? 2 - normalized : normalized;

    groupRef.current.position.lerpVectors(path.from, path.to, progress);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      returning ? path.headingBack : path.headingForward,
      0.08,
    );
  });

  return (
    <group ref={groupRef} scale={scale}>
      <Character
        color={color}
        skin={skin}
        pants={pants}
        hair={hair}
        walking
        stride={0.55}
        accessory={accessory}
      />
    </group>
  );
}
