import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import type { Mode, ProximityTarget, Scene } from "../store/gameStore";
import { Character } from "./Character";

const INFO_TARGET = new THREE.Vector3(5.95, 0, -3.65);
const TAXI_TARGET = new THREE.Vector3(10, 0, 3);
const INTERACT_RADIUS = 3.4;
const WALK_BOUNDS = {
  minX: -13.5,
  maxX: 12.5,
  minZ: -10.8,
  maxZ: 12.8,
};

const blockers = [
  { center: new THREE.Vector3(5, 0, -3), half: new THREE.Vector2(3.15, 1.25) },
  { center: new THREE.Vector3(-7.6, 0, -6.5), half: new THREE.Vector2(4.2, 0.95) },
  { center: new THREE.Vector3(-7.5, 0, -1.5), half: new THREE.Vector2(4.4, 2.25) },
  { center: new THREE.Vector3(-6.8, 0, 4), half: new THREE.Vector2(2.4, 0.8) },
];

export function PlayerController() {
  const groupRef = useRef<THREE.Group>(null);
  const [, getKeys] = useKeyboardControls();
  const setProximityTarget = useGameStore((s) => s.setProximityTarget);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const scene = useGameStore((s) => s.scene);
  const setScene = useGameStore((s) => s.setScene);

  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  const previousPosition = useRef(new THREE.Vector3(0, 0, 6));

  const { camera } = useThree();
  const cameraOffset = useMemo(() => new THREE.Vector3(0, 4.6, 7.2), []);
  const lookOffset = useMemo(() => new THREE.Vector3(0, 1.35, -0.2), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "e" || event.key === "E") {
        const target = useGameStore.getState().proximityTarget;
        if (target === "info") {
          setMode("conversation");
        } else if (target === "taxi") {
          setScene("taxi");
          setMode("conversation");
        }
      }

      if (event.key === "Escape" && useGameStore.getState().mode === "conversation") {
        setMode("world");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setMode, setScene]);

  useFrame((_state, delta) => {
    const player = groupRef.current;
    if (!player) return;

    const inputBlocked = mode === "conversation" || scene === "taxi";
    const keys = inputBlocked
      ? { forward: false, backward: false, left: false, right: false, run: false }
      : getKeys();

    const desiredDirection = new THREE.Vector3();
    if (keys.forward) desiredDirection.z -= 1;
    if (keys.backward) desiredDirection.z += 1;
    if (keys.left) desiredDirection.x -= 1;
    if (keys.right) desiredDirection.x += 1;

    const moving = desiredDirection.lengthSq() > 0;
    if (moving) desiredDirection.normalize();

    const speed = (keys.run ? 5.6 : 3.15) * delta;
    velocity.current.lerp(desiredDirection.multiplyScalar(speed), 0.26);
    previousPosition.current.copy(player.position);
    player.position.add(velocity.current);
    if (keepInWalkableAirport(player.position, previousPosition.current)) {
      velocity.current.set(0, 0, 0);
    }

    if (moving && velocity.current.lengthSq() > 0.00001) {
      targetRotation.current = Math.atan2(velocity.current.x, velocity.current.z);
    }
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation.current, 0.18);

    updateInteractionTarget(player.position, scene, mode, setProximityTarget);
    updateThirdPersonCamera(player, camera, scene, cameraOffset, lookOffset);
  });

  return (
    <group ref={groupRef} position={[0, 0, 6]}>
      <PlayerAvatar />
    </group>
  );
}

function keepInWalkableAirport(position: THREE.Vector3, previousPosition: THREE.Vector3) {
  position.x = THREE.MathUtils.clamp(position.x, WALK_BOUNDS.minX, WALK_BOUNDS.maxX);
  position.z = THREE.MathUtils.clamp(position.z, WALK_BOUNDS.minZ, WALK_BOUNDS.maxZ);

  const playerRadius = 0.42;
  const blocked = blockers.some((blocker) => {
    const dx = Math.abs(position.x - blocker.center.x);
    const dz = Math.abs(position.z - blocker.center.z);
    return dx < blocker.half.x + playerRadius && dz < blocker.half.y + playerRadius;
  });

  if (blocked) {
    position.copy(previousPosition);
    return true;
  }

  return false;
}

function updateInteractionTarget(
  position: THREE.Vector3,
  scene: Scene,
  mode: Mode,
  setProximityTarget: (target: ProximityTarget) => void
) {
  if (scene !== "airport" || mode !== "world") {
    setProximityTarget(null);
    return;
  }

  const candidates = [
    { target: "info" as const, distance: position.distanceTo(INFO_TARGET) },
    { target: "taxi" as const, distance: position.distanceTo(TAXI_TARGET) },
  ].filter((candidate) => candidate.distance < INTERACT_RADIUS);

  candidates.sort((a, b) => a.distance - b.distance);
  setProximityTarget(candidates[0]?.target ?? null);
}

function updateThirdPersonCamera(
  player: THREE.Group,
  camera: THREE.Camera,
  scene: Scene,
  cameraOffset: THREE.Vector3,
  lookOffset: THREE.Vector3
) {
  if (scene === "taxi") {
    camera.position.lerp(new THREE.Vector3(0.7, 1.5, -1.0), 0.1);
    camera.lookAt(0, 1.0, 4);
    player.position.set(0, -50, 0);
    return;
  }

  const desiredCameraPosition = player.position.clone().add(cameraOffset);
  camera.position.lerp(desiredCameraPosition, 0.08);
  camera.lookAt(player.position.clone().add(lookOffset));
}

function PlayerAvatar() {
  const isWorld = useGameStore((s) => s.mode === "world");
  const sceneIsAirport = useGameStore((s) => s.scene === "airport");
  const [, getKeys] = useKeyboardControls();
  const keys = getKeys();
  const walking = isWorld && sceneIsAirport && (keys.forward || keys.backward || keys.left || keys.right);

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
