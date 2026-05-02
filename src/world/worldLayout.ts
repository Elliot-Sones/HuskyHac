import * as THREE from 'three';
import type { ConversationStatus, SceneMode } from '@/shared/contracts';
import type { Vec2, WorldBounds, WorldCollider } from '@/world/physics';

export interface WorldTransitTarget {
  id: string;
  label: string;
  actionLabel: string;
  locationLabel: string;
  position: Vec2;
  radius: number;
}

export interface WorldCameraRig {
  followOffset: THREE.Vector3;
  lookOffset: THREE.Vector3;
  outdoorFollowOffset?: THREE.Vector3;
  outdoorLookOffset?: THREE.Vector3;
  outdoorThresholdZ?: number;
  conversationCamera?: THREE.Vector3;
  conversationLook?: THREE.Vector3;
}

export interface WorldConversationFocus {
  view?: 'taxiInterior' | 'busInterior';
  camera: THREE.Vector3;
  look: THREE.Vector3;
  avatarPosition?: THREE.Vector3;
  avatarRotationY?: number;
  avatarScale?: number;
}

export interface WorldLayout {
  id: string;
  playerStart: [number, number, number];
  playerStartRotation: number;
  npcPosition: THREE.Vector3;
  bounds: WorldBounds;
  colliders: WorldCollider[];
  transitTargets: WorldTransitTarget[];
  camera: WorldCameraRig;
  skyColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
}

export interface WorldSceneProps {
  mode: SceneMode;
  isNearNpc: boolean;
  conversationStatus: ConversationStatus;
}
