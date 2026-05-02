import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import { Character } from "./Character";

const NPC_POSITION = new THREE.Vector3(5, 0, -3);
const TAXI_POSITION = new THREE.Vector3(10, 0, 3);
const INTERACT_RADIUS = 3.5;

export function Player() {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Group>(null!);
  const [, getKeys] = useKeyboardControls();

  const setProximityTarget = useGameStore((s) => s.setProximityTarget);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const scene = useGameStore((s) => s.scene);
  const setScene = useGameStore((s) => s.setScene);

  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);

  const { camera } = useThree();
  const camOffset = useMemo(() => new THREE.Vector3(0, 4.2, 6), []);
  const camLookOffset = useMemo(() => new THREE.Vector3(0, 1.4, 0), []);

  // Press E to interact based on what we're standing next to.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") {
        const t = useGameStore.getState().proximityTarget;
        if (t === "info") {
          setMode("conversation");
        } else if (t === "taxi") {
          // Get into the taxi → switch scene + open conversation
          setScene("taxi");
          setMode("conversation");
        }
      }
      if (e.key === "Escape" && useGameStore.getState().mode === "conversation") {
        setMode("world");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMode, setScene]);

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // Don't move in conversation mode, OR when scene is taxi (player is seated)
    const inputBlocked = mode === "conversation" || scene === "taxi";
    const k = inputBlocked
      ? { forward: false, backward: false, left: false, right: false, run: false }
      : getKeys();

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

    // Proximity to interactables (only checked on airport scene)
    if (scene === "airport" && mode === "world") {
      const distInfo = g.position.distanceTo(NPC_POSITION);
      const distTaxi = g.position.distanceTo(TAXI_POSITION);
      let target: "info" | "taxi" | null = null;
      // Pick closest interactable within radius
      const candidates = [
        { t: "info" as const, d: distInfo },
        { t: "taxi" as const, d: distTaxi },
      ].filter((c) => c.d < INTERACT_RADIUS);
      candidates.sort((a, b) => a.d - b.d);
      if (candidates.length) target = candidates[0].t;
      setProximityTarget(target);
    } else {
      setProximityTarget(null);
    }

    // Camera behaviour:
    // - Airport: third-person trailing
    // - Taxi: locked rear-passenger seat POV
    if (scene === "taxi") {
      const desired = new THREE.Vector3(0.7, 1.5, -1.0);
      camera.position.lerp(desired, 0.1);
      camera.lookAt(0, 1.0, 4);
      // Hide the player in taxi mode by moving them off-camera.
      g.position.set(0, -50, 0);
    } else {
      const desiredCamPos = g.position.clone().add(camOffset);
      camera.position.lerp(desiredCamPos, 0.08);
      camera.lookAt(g.position.clone().add(camLookOffset));
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 6]}>
      <group ref={innerRef}>
        <PlayerCharacter />
      </group>
    </group>
  );
}

function PlayerCharacter() {
  const isWorld = useGameStore((s) => s.mode === "world");
  const sceneIsAirport = useGameStore((s) => s.scene === "airport");
  const [, getKeys] = useKeyboardControls();
  const k = getKeys();
  const walking = isWorld && sceneIsAirport && (k.forward || k.backward || k.left || k.right);

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
