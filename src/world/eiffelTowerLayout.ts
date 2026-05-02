import * as THREE from 'three';
import type { WorldBounds, WorldCollider } from '@/world/physics';
import type { WorldLayout, WorldTransitTarget } from '@/world/worldLayout';

export const EIFFEL_TOWER_NPC_POSITION = new THREE.Vector3(5.6, 0, -2.2);

export type EiffelTowerTransitTargetId = 'summit-lift' | 'seine-walk';
export type EiffelTowerTransitTarget = WorldTransitTarget & { id: EiffelTowerTransitTargetId };

export const EIFFEL_TOWER_BOUNDS: WorldBounds = {
  minX: -22,
  maxX: 22,
  minZ: -28,
  maxZ: 18,
};

export const EIFFEL_TOWER_COLLIDERS: WorldCollider[] = [
  {
    id: 'north-west-tower-leg',
    kind: 'rect',
    center: { x: -4.35, z: -10.9 },
    halfExtents: { x: 0.72, z: 1.12 },
    rotation: -0.18,
  },
  {
    id: 'north-east-tower-leg',
    kind: 'rect',
    center: { x: 4.35, z: -10.9 },
    halfExtents: { x: 0.72, z: 1.12 },
    rotation: 0.18,
  },
  {
    id: 'south-west-tower-leg',
    kind: 'rect',
    center: { x: -5.7, z: -3.2 },
    halfExtents: { x: 0.8, z: 1.16 },
    rotation: 0.18,
  },
  {
    id: 'south-east-tower-leg',
    kind: 'rect',
    center: { x: 5.7, z: -3.2 },
    halfExtents: { x: 0.8, z: 1.16 },
    rotation: -0.18,
  },
  {
    id: 'ticket-kiosk',
    kind: 'rect',
    center: { x: 6.05, z: -1.35 },
    halfExtents: { x: 1.5, z: 0.72 },
    rotation: -0.14,
  },
  {
    id: 'souvenir-stand',
    kind: 'rect',
    center: { x: -8.7, z: 1.5 },
    halfExtents: { x: 1.28, z: 0.62 },
    rotation: 0.22,
  },
  {
    id: 'camera-tripod',
    kind: 'rect',
    center: { x: -2.7, z: 4.8 },
    halfExtents: { x: 0.35, z: 0.35 },
  },
  {
    id: 'fountain-basin',
    kind: 'rect',
    center: { x: 0, z: 9.3 },
    halfExtents: { x: 3.2, z: 1.1 },
  },
  {
    id: 'left-garden-bed',
    kind: 'rect',
    center: { x: -14.7, z: -3.2 },
    halfExtents: { x: 2.4, z: 8.2 },
  },
  {
    id: 'right-garden-bed',
    kind: 'rect',
    center: { x: 14.7, z: -3.2 },
    halfExtents: { x: 2.4, z: 8.2 },
  },
  {
    id: 'seine-railing-left',
    kind: 'rect',
    center: { x: -8.8, z: -22.5 },
    halfExtents: { x: 6.1, z: 0.22 },
  },
  {
    id: 'seine-railing-right',
    kind: 'rect',
    center: { x: 8.8, z: -22.5 },
    halfExtents: { x: 6.1, z: 0.22 },
  },
];

export const EIFFEL_TOWER_TRANSIT_TARGETS: EiffelTowerTransitTarget[] = [
  {
    id: 'summit-lift',
    label: 'Summit lift queue',
    actionLabel: 'Join lift queue',
    locationLabel: 'Pillar elevator entrance',
    position: { x: 0, z: -6.3 },
    radius: 2.7,
  },
  {
    id: 'seine-walk',
    label: 'Seine river walk',
    actionLabel: 'Walk to the Seine',
    locationLabel: 'Riverside promenade',
    position: { x: 0, z: -24.0 },
    radius: 2.5,
  },
];

export const eiffelTowerWorldLayout: WorldLayout = {
  id: 'france-eiffel_tour',
  playerStart: [0, 0, 13.2],
  playerStartRotation: Math.PI,
  npcPosition: EIFFEL_TOWER_NPC_POSITION,
  bounds: EIFFEL_TOWER_BOUNDS,
  colliders: EIFFEL_TOWER_COLLIDERS,
  transitTargets: EIFFEL_TOWER_TRANSIT_TARGETS,
  camera: {
    followOffset: new THREE.Vector3(0, 5.0, 8.0),
    lookOffset: new THREE.Vector3(0, 1.25, -0.9),
    outdoorFollowOffset: new THREE.Vector3(0, 5.2, 7.2),
    outdoorLookOffset: new THREE.Vector3(0, 1.3, -1.0),
    outdoorThresholdZ: EIFFEL_TOWER_BOUNDS.minZ - 1,
    conversationCamera: new THREE.Vector3(7.3, 2.75, 1.7),
    conversationLook: EIFFEL_TOWER_NPC_POSITION.clone().add(new THREE.Vector3(0, 1.55, 0.1)),
  },
  skyColor: '#bfe5ff',
  fogColor: '#cbeeff',
  fogNear: 22,
  fogFar: 72,
};
