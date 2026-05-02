import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneMode } from '@/shared/contracts';
import { Character } from '@/world/Character';
import {
  AIRPORT_BOUNDS,
  AIRPORT_COLLIDERS,
  AIRPORT_NPC_POSITION,
  PLAYER_COLLIDER_RADIUS,
} from '@/world/airportLayout';
import { moveCircleWithColliders } from '@/world/physics';

interface PlayerControllerProps {
  mode: SceneMode;
  onNearNpcChange: (near: boolean) => void;
  onInteract: () => void;
}

const interactRadius = 3.3;

export function PlayerController({ mode, onNearNpcChange, onInteract }: PlayerControllerProps) {
  const playerRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(Math.PI);
  const lastNear = useRef(false);
  const [walking, setWalking] = useState(false);
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();

  const followOffset = useMemo(() => new THREE.Vector3(0, 4.7, 7.4), []);
  const lookOffset = useMemo(() => new THREE.Vector3(0, 1.25, -0.6), []);
  const outdoorFollowOffset = useMemo(() => new THREE.Vector3(0, 4.5, 3.4), []);
  const outdoorLookOffset = useMemo(() => new THREE.Vector3(0, 1.15, -0.25), []);
  const conversationCamera = useMemo(() => new THREE.Vector3(4.5, 2.45, 2.35), []);
  const conversationLook = useMemo(() => AIRPORT_NPC_POSITION.clone().add(new THREE.Vector3(0, 1.55, 0.2)), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'e' && lastNear.current && mode === 'world') {
        onInteract();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onInteract]);

  useFrame((_state, delta) => {
    const player = playerRef.current;
    if (!player) return;

    if (mode !== 'world') {
      velocity.current.multiplyScalar(0.75);
      setWalking(false);
      camera.position.lerp(conversationCamera, 0.08);
      camera.lookAt(conversationLook);
      return;
    }

    const keys = getKeys();
    const input = new THREE.Vector3(
      Number(keys.right) - Number(keys.left),
      0,
      Number(keys.backward) - Number(keys.forward),
    );
    const moving = input.lengthSq() > 0;

    if (moving) {
      input.normalize();
      const speed = keys.run ? 5.8 : 3.4;
      velocity.current.lerp(input.multiplyScalar(speed * delta), 0.32);
      targetRotation.current = Math.atan2(velocity.current.x, velocity.current.z);
    } else {
      velocity.current.multiplyScalar(0.72);
    }

    const desiredDelta = { x: velocity.current.x, z: velocity.current.z };
    const currentPosition = { x: player.position.x, z: player.position.z };
    const nextPosition = moveCircleWithColliders(
      currentPosition,
      desiredDelta,
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );
    const blockedX = Math.abs(nextPosition.x - (currentPosition.x + desiredDelta.x)) > 0.001;
    const blockedZ = Math.abs(nextPosition.z - (currentPosition.z + desiredDelta.z)) > 0.001;

    player.position.x = nextPosition.x;
    player.position.z = nextPosition.z;
    if (blockedX) velocity.current.x = 0;
    if (blockedZ) velocity.current.z = 0;
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation.current, 0.18);

    if (visualRef.current) {
      visualRef.current.rotation.z = Math.sin(_state.clock.elapsedTime * 8) * (moving ? 0.025 : 0);
    }

    setWalking(moving);

    const near = player.position.distanceTo(AIRPORT_NPC_POSITION) < interactRadius;
    if (near !== lastNear.current) {
      lastNear.current = near;
      onNearNpcChange(near);
    }

    const outsideTerminal = player.position.z < -11;
    const targetCam = player.position.clone().add(outsideTerminal ? outdoorFollowOffset : followOffset);
    const lookAt = player.position.clone().add(outsideTerminal ? outdoorLookOffset : lookOffset);
    camera.position.lerp(targetCam, 0.08);
    camera.lookAt(lookAt);

    window.__huskyPlayerPosition = {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    };
    window.__huskyCollisionDebug = {
      blockedX,
      blockedZ,
      colliderCount: AIRPORT_COLLIDERS.length,
    };
  });

  return (
    <group ref={playerRef} position={[0, 0, 8.6]} rotation={[0, Math.PI, 0]} name="player">
      <group ref={visualRef}>
        <Character color="#ef4444" pants="#111827" hair="#111827" accessory="backpack" walking={walking} />
      </group>
    </group>
  );
}

declare global {
  interface Window {
    __huskyPlayerPosition?: { x: number; y: number; z: number };
    __huskyCollisionDebug?: { blockedX: boolean; blockedZ: boolean; colliderCount: number };
  }
}
