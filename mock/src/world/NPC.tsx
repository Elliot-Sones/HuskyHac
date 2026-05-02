import { useEffect, useMemo, useRef } from "react";
import { useGLTF, useAnimations, Html, Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

const NPC_GLB = "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
useGLTF.preload(NPC_GLB);

export function NPC() {
  const { scene, animations } = useGLTF(NPC_GLB) as any;
  const groupRef = useRef<THREE.Group>(null!);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        // tint robot to read as "info-desk uniform"
        if (o.material && o.material.color) {
          // leave color alone — robot has its own palette
        }
      }
    });
    return c;
  }, [scene]);

  const { actions } = useAnimations(animations, cloned);

  useEffect(() => {
    // Robot has many anims; "Idle" exists on this rig
    const idle = actions["Idle"] || actions[Object.keys(actions)[0]];
    idle?.reset().fadeIn(0.2).play();
  }, [actions]);

  // Subtle bob
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
  });

  const isNear = useGameStore((s) => s.isNearNPC);
  const mode = useGameStore((s) => s.mode);

  return (
    <group position={[5, 0, -3.6]} rotation={[0, Math.PI, 0]}>
      <group ref={groupRef} scale={0.55}>
        <primitive object={cloned} />
      </group>

      {/* floating name tag */}
      <Billboard position={[0, 2.4, 0]}>
        <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
          <div className="glass-light text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-md ring-1 ring-emerald-500/40 shadow-lg whitespace-nowrap">
            Mme. Laurent · Information
          </div>
        </Html>
      </Billboard>

      {/* interaction prompt - shown only when player is close + in world mode */}
      {isNear && mode === "world" && (
        <Billboard position={[0, 1.6, 0]}>
          <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-emerald-400/40 pulse-ring"></div>
              <div className="relative bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg ring-2 ring-emerald-300/40 pulse-dot whitespace-nowrap">
                <span className="font-mono mr-1.5 bg-white/20 rounded px-1 py-0.5 text-[10px]">E</span>
                Talk to her
              </div>
            </div>
          </Html>
        </Billboard>
      )}

      {/* Floor ring marker so the player can see the spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.7, 0.85, 48]} />
        <meshBasicMaterial color={isNear ? "#34d399" : "#fbbf24"} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

void Text;
