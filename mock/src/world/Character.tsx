import { forwardRef, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Stylized "person" assembled from primitives.
 * Reliable, instant render, looks like a low-poly character (Crossy-Road / Roblox vibe).
 * We swap this for proper GLBs later behind an error boundary, but this
 * is enough to mock the scene + camera + interactions today.
 */
export interface CharacterProps {
  /** Body/clothing color */
  color: string;
  /** Skin color */
  skin?: string;
  /** Pant color */
  pants?: string;
  /** Hair / hat color */
  hair?: string;
  /** True if the character should appear to walk (limb sway) */
  walking?: boolean;
  /** True if the character should appear to talk (jaw move) */
  talking?: boolean;
  /** Optional accessory: backpack | scarf | nametag */
  accessory?: "backpack" | "scarf" | "nametag";
}

export const Character = forwardRef<THREE.Group, CharacterProps>(function Character(
  {
    color,
    skin = "#fde0c2",
    pants = "#1f2937",
    hair = "#1f2937",
    walking = false,
    talking = false,
    accessory,
  },
  ref
) {
  const leftArmRef = useRef<THREE.Mesh>(null!);
  const rightArmRef = useRef<THREE.Mesh>(null!);
  const leftLegRef = useRef<THREE.Mesh>(null!);
  const rightLegRef = useRef<THREE.Mesh>(null!);
  const jawRef = useRef<THREE.Mesh>(null!);
  const headRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle idle bob on head
    if (headRef.current) {
      headRef.current.position.y = 1.55 + Math.sin(t * 1.6) * 0.012;
    }

    // Walking: swing arms + legs
    if (walking) {
      const swing = Math.sin(t * 8) * 0.6;
      if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swing * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = swing * 0.8;
    } else {
      const idle = Math.sin(t * 1.5) * 0.06;
      if (leftArmRef.current) leftArmRef.current.rotation.x = idle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -idle;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }

    // Talking jaw flap
    if (jawRef.current) {
      const open = talking ? Math.abs(Math.sin(t * 16)) * 0.06 + 0.02 : 0.0;
      jawRef.current.scale.y = 1 + open * 6;
      jawRef.current.position.y = 1.34 - open * 1.5;
    }
  });

  return (
    <group ref={ref} dispose={null}>
      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.18, 24, 18]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Hair / cap */}
      <mesh castShadow position={[0, 1.66, -0.02]}>
        <sphereGeometry args={[0.185, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color={hair} roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 1.56, 0.16]}>
        <sphereGeometry args={[0.022, 12, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.06, 1.56, 0.16]}>
        <sphereGeometry args={[0.022, 12, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Mouth (talks) */}
      <mesh ref={jawRef} position={[0, 1.46, 0.165]}>
        <boxGeometry args={[0.06, 0.012, 0.005]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.08, 12]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      {/* Torso */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[0.46, 0.55, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Arms */}
      <group position={[-0.27, 1.25, 0]}>
        <mesh ref={leftArmRef} castShadow position={[0, -0.22, 0]}>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group position={[0.27, 1.25, 0]}>
        <mesh ref={rightArmRef} castShadow position={[0, -0.22, 0]}>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>

      {/* Legs */}
      <group position={[-0.12, 0.75, 0]}>
        <mesh ref={leftLegRef} castShadow position={[0, -0.32, 0]}>
          <boxGeometry args={[0.14, 0.66, 0.14]} />
          <meshStandardMaterial color={pants} />
        </mesh>
      </group>
      <group position={[0.12, 0.75, 0]}>
        <mesh ref={rightLegRef} castShadow position={[0, -0.32, 0]}>
          <boxGeometry args={[0.14, 0.66, 0.14]} />
          <meshStandardMaterial color={pants} />
        </mesh>
      </group>

      {/* Shoes */}
      <mesh castShadow position={[-0.12, 0.07, 0.04]}>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh castShadow position={[0.12, 0.07, 0.04]}>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Optional accessory */}
      {accessory === "backpack" && (
        <mesh castShadow position={[0, 1.05, -0.18]}>
          <boxGeometry args={[0.36, 0.45, 0.18]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      )}
      {accessory === "scarf" && (
        <mesh castShadow position={[0, 1.32, 0.05]}>
          <torusGeometry args={[0.13, 0.05, 8, 24]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      )}
      {accessory === "nametag" && (
        <mesh position={[0.13, 1.18, 0.135]}>
          <boxGeometry args={[0.1, 0.06, 0.005]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  );
});
