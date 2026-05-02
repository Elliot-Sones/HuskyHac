import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

const PLAYER_GLB = "https://threejs.org/examples/models/gltf/Soldier.glb";
useGLTF.preload(PLAYER_GLB);

const NPC_POSITION = new THREE.Vector3(5, 0, -3);
const INTERACT_RADIUS = 3.5;

export function Player() {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(PLAYER_GLB) as any;

  // Clone the gltf scene so multiple Soldier instances don't share materials
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  const { actions } = useAnimations(animations, cloned);
  const [, getKeys] = useKeyboardControls();

  const setIsNearNPC = useGameStore((s) => s.setIsNearNPC);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);

  // Velocity smoothing
  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);

  // Camera follow target
  const { camera } = useThree();
  const camOffset = useMemo(() => new THREE.Vector3(0, 4.2, 6), []);
  const camLookOffset = useMemo(() => new THREE.Vector3(0, 1.4, 0), []);

  // Press E to enter conversation when near NPC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "e" || e.key === "E") && useGameStore.getState().isNearNPC) {
        setMode("conversation");
      }
      if (e.key === "Escape" && useGameStore.getState().mode === "conversation") {
        setMode("world");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMode]);

  // Start with idle
  useEffect(() => {
    const idle = actions["Idle"] || actions[Object.keys(actions)[0]];
    idle?.reset().fadeIn(0.2).play();
  }, [actions]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Disable input while in conversation mode
    const k = mode === "world" ? getKeys() : { forward: false, backward: false, left: false, right: false, run: false };
    const dir = new THREE.Vector3();
    if (k.forward) dir.z -= 1;
    if (k.backward) dir.z += 1;
    if (k.left) dir.x -= 1;
    if (k.right) dir.x += 1;
    const moving = dir.lengthSq() > 0;
    if (moving) dir.normalize();

    const speed = (k.run ? 5.5 : 3) * delta;
    velocity.current.lerp(dir.multiplyScalar(speed), 0.25);
    g.position.add(velocity.current);

    // Face direction of motion
    if (moving) {
      targetRotation.current = Math.atan2(velocity.current.x, velocity.current.z);
    }
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRotation.current, 0.18);

    // Animation cross-fade
    const idleA = actions["Idle"];
    const walkA = actions["Walk"];
    const runA = actions["Run"];
    if (moving) {
      const wantRun = !!k.run;
      const target = wantRun ? runA : walkA;
      idleA?.fadeOut(0.2);
      (wantRun ? walkA : runA)?.fadeOut(0.2);
      target?.reset().fadeIn(0.2).play();
    } else {
      walkA?.fadeOut(0.2);
      runA?.fadeOut(0.2);
      idleA?.reset().fadeIn(0.2).play();
    }

    // Detect proximity to NPC
    const dist = g.position.distanceTo(NPC_POSITION);
    setIsNearNPC(dist < INTERACT_RADIUS && mode === "world");

    // Camera follow (third-person trailing)
    const desiredCamPos = g.position.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 0.08);
    const lookAt = g.position.clone().add(camLookOffset);
    camera.lookAt(lookAt);
  });

  return (
    <group ref={groupRef} position={[0, 0, 6]} scale={1}>
      <primitive object={cloned} />
    </group>
  );
}
