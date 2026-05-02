import { forwardRef, type RefObject, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type CharacterAccessory = 'backpack' | 'nametag' | 'scarf' | 'suitcase';

export interface CharacterProps {
  color?: string;
  skin?: string;
  pants?: string;
  hair?: string;
  shoeColor?: string;
  walking?: boolean;
  talking?: boolean;
  walkingRef?: RefObject<boolean>;
  talkingRef?: RefObject<boolean>;
  idleBob?: boolean;
  stride?: number;
  strideRef?: RefObject<number>;
  accessory?: CharacterAccessory;
}

export const Character = forwardRef<THREE.Group, CharacterProps>(function Character(
  {
    color = '#2563eb',
    skin = '#f6c7a6',
    pants = '#243142',
    hair = '#3a2417',
    shoeColor = '#111827',
    walking = false,
    talking = false,
    walkingRef,
    talkingRef,
    idleBob = true,
    stride = 1,
    strideRef,
    accessory,
  },
  ref,
) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const suitcaseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const isWalking = walkingRef?.current ?? walking;
    const isTalking = talkingRef?.current ?? talking;
    const strideValue = strideRef?.current ?? stride;
    const walkPulse = Math.sin(time * 7.5) * strideValue;
    const calmPulse = Math.sin(time * 1.8);

    if (bodyRef.current) {
      const bob = isWalking ? Math.abs(Math.sin(time * 7.5)) * 0.035 : calmPulse * 0.018;
      bodyRef.current.position.y = idleBob ? bob : 0;
    }

    if (headRef.current) {
      headRef.current.rotation.z = isWalking ? Math.sin(time * 7.5) * 0.035 : calmPulse * 0.025;
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = isWalking ? -walkPulse * 0.55 : calmPulse * 0.045;
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = isWalking ? walkPulse * 0.55 : -calmPulse * 0.045;
    }

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = isWalking ? walkPulse * 0.42 : 0;
    }

    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = isWalking ? -walkPulse * 0.42 : 0;
    }

    if (mouthRef.current) {
      const open = isTalking ? 1 + Math.abs(Math.sin(time * 14)) * 2.8 : 1;
      mouthRef.current.scale.y = open;
    }

    if (suitcaseRef.current) {
      suitcaseRef.current.rotation.x = isWalking ? -walkPulse * 0.18 : calmPulse * 0.025;
    }
  });

  return (
    <group ref={ref} dispose={null}>
      <group ref={bodyRef}>
        <group ref={headRef}>
          <mesh castShadow position={[0, 1.62, 0]}>
            <sphereGeometry args={[0.19, 10, 8]} />
            <meshStandardMaterial color={skin} roughness={0.8} flatShading />
          </mesh>
          <mesh castShadow position={[0, 1.75, -0.025]} rotation={[0.08, 0, 0]}>
            <sphereGeometry args={[0.195, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
            <meshStandardMaterial color={hair} roughness={0.9} flatShading />
          </mesh>
          <mesh position={[-0.065, 1.625, 0.165]}>
            <boxGeometry args={[0.035, 0.035, 0.018]} />
            <meshStandardMaterial color="#101827" />
          </mesh>
          <mesh position={[0.065, 1.625, 0.165]}>
            <boxGeometry args={[0.035, 0.035, 0.018]} />
            <meshStandardMaterial color="#101827" />
          </mesh>
          <mesh ref={mouthRef} position={[0, 1.535, 0.176]}>
            <boxGeometry args={[0.085, 0.014, 0.014]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
          </mesh>
        </group>

        <mesh castShadow position={[0, 1.34, 0]}>
          <cylinderGeometry args={[0.07, 0.085, 0.12, 8]} />
          <meshStandardMaterial color={skin} roughness={0.75} flatShading />
        </mesh>

        <mesh castShadow position={[0, 1.04, 0]}>
          <boxGeometry args={[0.48, 0.58, 0.28]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>

        <group ref={leftArmRef} position={[-0.31, 1.28, 0]}>
          <mesh castShadow position={[0, -0.24, 0]}>
            <boxGeometry args={[0.12, 0.5, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh castShadow position={[0, -0.53, 0.02]}>
            <boxGeometry args={[0.13, 0.11, 0.13]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.31, 1.28, 0]}>
          <mesh castShadow position={[0, -0.24, 0]}>
            <boxGeometry args={[0.12, 0.5, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.82} />
          </mesh>
          <mesh castShadow position={[0, -0.53, 0.02]}>
            <boxGeometry args={[0.13, 0.11, 0.13]} />
            <meshStandardMaterial color={skin} roughness={0.75} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.13, 0.77, 0]}>
          <mesh castShadow position={[0, -0.32, 0]}>
            <boxGeometry args={[0.15, 0.64, 0.15]} />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.67, 0.055]}>
            <boxGeometry args={[0.17, 0.1, 0.24]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.13, 0.77, 0]}>
          <mesh castShadow position={[0, -0.32, 0]}>
            <boxGeometry args={[0.15, 0.64, 0.15]} />
            <meshStandardMaterial color={pants} roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, -0.67, 0.055]}>
            <boxGeometry args={[0.17, 0.1, 0.24]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} />
          </mesh>
        </group>

        {accessory === 'backpack' && (
          <mesh castShadow position={[0, 1.05, -0.2]}>
            <boxGeometry args={[0.36, 0.46, 0.16]} />
            <meshStandardMaterial color="#be123c" roughness={0.82} />
          </mesh>
        )}

        {accessory === 'nametag' && (
          <mesh position={[0.15, 1.16, 0.147]}>
            <boxGeometry args={[0.13, 0.07, 0.012]} />
            <meshStandardMaterial color="#facc15" roughness={0.45} />
          </mesh>
        )}

        {accessory === 'scarf' && (
          <>
            <mesh castShadow position={[0, 1.33, 0.03]}>
              <torusGeometry args={[0.16, 0.035, 6, 18]} />
              <meshStandardMaterial color="#dc2626" roughness={0.75} />
            </mesh>
            <mesh castShadow position={[0.07, 1.15, 0.13]} rotation={[0, 0, -0.18]}>
              <boxGeometry args={[0.08, 0.32, 0.045]} />
              <meshStandardMaterial color="#dc2626" roughness={0.75} />
            </mesh>
          </>
        )}

        {accessory === 'suitcase' && (
          <group ref={suitcaseRef} position={[0.48, 0.48, 0.02]}>
            <mesh castShadow position={[0, -0.12, 0]}>
              <boxGeometry args={[0.24, 0.34, 0.16]} />
              <meshStandardMaterial color="#0f766e" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <boxGeometry args={[0.15, 0.035, 0.035]} />
              <meshStandardMaterial color="#475569" roughness={0.55} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
});
