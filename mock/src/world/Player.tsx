import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { Character } from "./Character";

const NPC_POSITION = new THREE.Vector3(5, 0, -3);
const INTERACT_RADIUS = 3.5;

export function Player() {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const [, getKeys] = useKeyboardControls();

  const setIsNearNPC = useGameStore((s) => s.setIsNearNPC);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);

  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  const isWalking = useRef(false);

  const { camera } = useThree();
  const camOffset = useMemo(() => new THREE.Vector3(0, 4.2, 6), []);
  const camLookOffset = useMemo(() => new THREE.Vector3(0, 1.4, 0), []);

  // Press E to interact
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

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const k = mode === "world"
      ? getKeys()
      : { forward: false, backward: false, left: false, right: false, run: false };

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

    if (moving) {
      targetRotation.current = Math.atan2(velocity.current.x, velocity.current.z);
    }
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRotation.current, 0.18);
    isWalking.current = moving;

    const dist = g.position.distanceTo(NPC_POSITION);
    setIsNearNPC(dist < INTERACT_RADIUS && mode === "world");

    const desiredCamPos = g.position.clone().add(camOffset);
    camera.position.lerp(desiredCamPos, 0.08);
    camera.lookAt(g.position.clone().add(camLookOffset));
  });

  // We can't conditionally update Character with state in useFrame easily,
  // so we expose a simple fact via the store (alternative: ref-driven scale).
  // Walking visual is handled inside Character via its own useFrame using
  // a simple heuristic: walking when last movement occurred. We pass via prop.
  const walkingFlag = useGameStore((s) => s.mode === "world"); // permissive while in world
  void walkingFlag;

  return (
    <group ref={groupRef} position={[0, 0, 6]}>
      <group ref={innerRef}>
        <PlayerCharacter />
      </group>
    </group>
  );
}

// Tiny wrapper that watches the player ref and animates accordingly.
// Simpler: just pass a tween-detected walking based on velocity each frame.
function PlayerCharacter() {
  // We pass walking=true when WASD pressed via a subscription
  const isWorld = useGameStore((s) => s.mode) === "world";
  const [, getKeys] = useKeyboardControls();

  // Read keys each render (cheap), forward as prop
  const k = getKeys();
  const walking = isWorld && (k.forward || k.backward || k.left || k.right);

  return (
    <Character
      color="#dc2626"
      pants="#1f2937"
      hair="#1f2937"
      skin="#fdbb96"
      walking={walking}
      accessory="backpack"
    />
  );
}
