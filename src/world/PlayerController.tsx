import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import type { PlayerSnapshot, SceneMode } from '@/shared/contracts';
import { createSnapshotPublisher } from '@/multiplayer/snapshotPublisher';
import type { LocalPlayerProfile } from '@/play/playerProfile';
import { Character } from '@/world/Character';
import { PLAYER_COLLIDER_RADIUS } from '@/world/airportLayout';
import { moveCircleWithColliders } from '@/world/physics';
import type { WorldConversationFocus, WorldLayout, WorldTransitTarget } from '@/world/worldLayout';

interface PlayerControllerProps {
  mode: SceneMode;
  layout: WorldLayout;
  onNearNpcChange: (near: boolean) => void;
  onNearTransitChange: (target: WorldTransitTarget | null) => void;
  onInteract: () => void;
  onTransitInteract: (target: WorldTransitTarget) => void;
  playerProfile: LocalPlayerProfile;
  conversationFocus?: WorldConversationFocus | null;
  multiplayerSelfId?: string;
  onPublishSnapshot?: (snapshot: PlayerSnapshot) => void;
}

const interactRadius = 3.3;
const yAxis = new THREE.Vector3(0, 1, 0);
const defaultAvatarScale = new THREE.Vector3(1, 1, 1);
const defaultAvatarPosition = new THREE.Vector3(0, 0, 0);

export function PlayerController({
  mode,
  layout,
  onNearNpcChange,
  onNearTransitChange,
  onInteract,
  onTransitInteract,
  playerProfile,
  conversationFocus = null,
  multiplayerSelfId,
  onPublishSnapshot,
}: PlayerControllerProps) {
  const playerRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(layout.playerStartRotation);
  const lastNear = useRef(false);
  const lastTransit = useRef<WorldTransitTarget | null>(null);
  const walkingState = useRef(false);
  const [walking, setWalking] = useState(false);
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const layoutRef = useRef(layout);
  const conversationFocusRef = useRef(conversationFocus);
  const snapshotPublisher = useMemo(
    () =>
      createSnapshotPublisher({
        publish: (snapshot) => onPublishSnapshot?.(snapshot),
      }),
    [onPublishSnapshot],
  );

  const conversationFallbackLook = useMemo(() => new THREE.Vector3(0, 1.55, 0.2), []);

  useEffect(() => {
    layoutRef.current = layout;
    conversationFocusRef.current = conversationFocus;
  }, [conversationFocus, layout]);

  useEffect(() => {
    lastNear.current = false;
    lastTransit.current = null;
    velocity.current.set(0, 0, 0);
    targetRotation.current = layout.playerStartRotation;
    onNearNpcChange(false);
    onNearTransitChange(null);
    snapshotPublisher.reset();
  }, [layout.id, layout.playerStartRotation, onNearNpcChange, onNearTransitChange]);

  useEffect(() => {
    snapshotPublisher.reset();
  }, [multiplayerSelfId, snapshotPublisher]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'e' && lastNear.current && mode === 'world') {
        onInteract();
      } else if (event.key.toLowerCase() === 'e' && lastTransit.current && mode === 'world') {
        onTransitInteract(lastTransit.current);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onInteract, onTransitInteract]);

  function setWalkingIfChanged(nextWalking: boolean) {
    if (walkingState.current === nextWalking) return;
    walkingState.current = nextWalking;
    setWalking(nextWalking);
  }

  function publishLocalSnapshot(player: THREE.Group, isWalking: boolean, isRunning: boolean) {
    if (!multiplayerSelfId || !onPublishSnapshot) return;

    snapshotPublisher.tryPublish({
      playerId: multiplayerSelfId,
      position: {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      },
      rotationY: player.rotation.y,
      walking: isWalking,
      running: isRunning,
      mode,
    });
  }

  useFrame((_state, delta) => {
    const player = playerRef.current;
    if (!player) return;
    const activeLayout = layoutRef.current;
    const {
      camera: cameraRig,
      npcPosition,
      colliders,
      bounds,
      transitTargets,
    } = activeLayout;

    if (mode !== 'world') {
      velocity.current.multiplyScalar(0.75);
      setWalkingIfChanged(false);
      const activeFocus = conversationFocusRef.current;
      const conversationCamera = activeFocus?.camera ?? cameraRig.conversationCamera ?? cameraRig.followOffset;
      const conversationLook =
        activeFocus?.look ?? cameraRig.conversationLook ?? npcPosition.clone().add(conversationFallbackLook);
      camera.position.lerp(conversationCamera, 0.08);
      camera.lookAt(conversationLook);
      window.__huskyCameraDebug = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        lookX: conversationLook.x,
        lookY: conversationLook.y,
        lookZ: conversationLook.z,
      };
      if (visualRef.current) {
        if (activeFocus?.avatarPosition) {
          const localAvatarPosition = activeFocus.avatarPosition
            .clone()
            .sub(player.position)
            .applyAxisAngle(yAxis, -player.rotation.y);
          const avatarScale = activeFocus.avatarScale ?? 1;

          visualRef.current.position.lerp(localAvatarPosition, 0.18);
          visualRef.current.rotation.y = THREE.MathUtils.lerp(
            visualRef.current.rotation.y,
            (activeFocus.avatarRotationY ?? player.rotation.y) - player.rotation.y,
            0.18,
          );
          visualRef.current.scale.lerp(new THREE.Vector3(avatarScale, avatarScale, avatarScale), 0.18);
          window.__huskyAvatarDebug = {
            x: activeFocus.avatarPosition.x,
            y: activeFocus.avatarPosition.y,
            z: activeFocus.avatarPosition.z,
            scale: avatarScale,
          };
        } else {
          visualRef.current.position.lerp(defaultAvatarPosition, 0.18);
          visualRef.current.rotation.y = THREE.MathUtils.lerp(visualRef.current.rotation.y, 0, 0.18);
          visualRef.current.scale.lerp(defaultAvatarScale, 0.18);
          window.__huskyAvatarDebug = undefined;
        }
      }
      publishLocalSnapshot(player, false, false);
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
      colliders,
      bounds,
    );
    const blockedX = Math.abs(nextPosition.x - (currentPosition.x + desiredDelta.x)) > 0.001;
    const blockedZ = Math.abs(nextPosition.z - (currentPosition.z + desiredDelta.z)) > 0.001;

    player.position.x = nextPosition.x;
    player.position.z = nextPosition.z;
    if (blockedX) velocity.current.x = 0;
    if (blockedZ) velocity.current.z = 0;
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation.current, 0.18);

    if (visualRef.current) {
      visualRef.current.position.lerp(defaultAvatarPosition, 0.24);
      visualRef.current.rotation.y = THREE.MathUtils.lerp(visualRef.current.rotation.y, 0, 0.24);
      visualRef.current.scale.lerp(defaultAvatarScale, 0.24);
      visualRef.current.rotation.z = Math.sin(_state.clock.elapsedTime * 8) * (moving ? 0.025 : 0);
    }

    setWalkingIfChanged(moving);

    const near = player.position.distanceTo(npcPosition) < interactRadius;
    if (near !== lastNear.current) {
      lastNear.current = near;
      onNearNpcChange(near);
    }

    const nearestTransit =
      transitTargets.find(
        (target) =>
          Math.hypot(player.position.x - target.position.x, player.position.z - target.position.z) <
          target.radius,
      ) ?? null;
    if (nearestTransit?.id !== lastTransit.current?.id) {
      lastTransit.current = nearestTransit;
      onNearTransitChange(nearestTransit);
    }

    const outsideTerminal = player.position.z < (cameraRig.outdoorThresholdZ ?? Number.NEGATIVE_INFINITY);
    const targetCam = player.position
      .clone()
      .add(outsideTerminal ? cameraRig.outdoorFollowOffset ?? cameraRig.followOffset : cameraRig.followOffset);
    const lookAt = player.position
      .clone()
      .add(outsideTerminal ? cameraRig.outdoorLookOffset ?? cameraRig.lookOffset : cameraRig.lookOffset);
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
      colliderCount: colliders.length,
    };
    window.__huskyPlayerProfile = playerProfile;

    publishLocalSnapshot(player, moving, Boolean(keys.run && moving));
  });

  return (
    <group
      ref={playerRef}
      position={layout.playerStart}
      rotation={[0, layout.playerStartRotation, 0]}
      name="player"
    >
      <group ref={visualRef}>
        <Character
          color={playerProfile.color}
          pants="#111827"
          hair="#111827"
          accessory={playerProfile.accessory}
          walking={walking}
        />
      </group>
    </group>
  );
}

declare global {
  interface Window {
    __huskyPlayerPosition?: { x: number; y: number; z: number };
    __huskyCollisionDebug?: { blockedX: boolean; blockedZ: boolean; colliderCount: number };
    __huskyCameraDebug?: { x: number; y: number; z: number; lookX: number; lookY: number; lookZ: number };
    __huskyAvatarDebug?: { x: number; y: number; z: number; scale: number };
    __huskyPlayerProfile?: LocalPlayerProfile;
  }
}
