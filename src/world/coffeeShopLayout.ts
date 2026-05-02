import * as THREE from 'three';
import type { WorldBounds, WorldCollider } from '@/world/physics';
import type { WorldLayout } from '@/world/worldLayout';

export const COFFEE_SHOP_NPC_POSITION = new THREE.Vector3(0, 0, -3.7);

export const COFFEE_SHOP_BOUNDS: WorldBounds = {
  minX: -7.6,
  maxX: 7.6,
  minZ: -6.6,
  maxZ: 6.6,
};

export const COFFEE_SHOP_COLLIDERS: WorldCollider[] = [
  {
    id: 'back-wall',
    kind: 'rect',
    center: { x: 0, z: -6.4 },
    halfExtents: { x: 7.5, z: 0.22 },
  },
  {
    id: 'left-wall',
    kind: 'rect',
    center: { x: -7.4, z: 0 },
    halfExtents: { x: 0.22, z: 6.4 },
  },
  {
    id: 'right-wall',
    kind: 'rect',
    center: { x: 7.4, z: 0 },
    halfExtents: { x: 0.22, z: 6.4 },
  },
  {
    id: 'front-wall-left',
    kind: 'rect',
    center: { x: -4.4, z: 6.4 },
    halfExtents: { x: 3.0, z: 0.22 },
  },
  {
    id: 'front-wall-right',
    kind: 'rect',
    center: { x: 4.4, z: 6.4 },
    halfExtents: { x: 3.0, z: 0.22 },
  },
  {
    id: 'counter',
    kind: 'rect',
    center: { x: 0, z: -3.0 },
    halfExtents: { x: 4.5, z: 0.6 },
  },
  {
    id: 'pastry-case',
    kind: 'rect',
    center: { x: 3.0, z: -2.8 },
    halfExtents: { x: 1.0, z: 0.45 },
  },
  {
    id: 'table-1',
    kind: 'rect',
    center: { x: -3.6, z: 1.4 },
    halfExtents: { x: 0.6, z: 0.6 },
  },
  {
    id: 'table-2',
    kind: 'rect',
    center: { x: 3.6, z: 1.4 },
    halfExtents: { x: 0.6, z: 0.6 },
  },
  {
    id: 'table-3',
    kind: 'rect',
    center: { x: -3.6, z: 4.2 },
    halfExtents: { x: 0.6, z: 0.6 },
  },
  {
    id: 'table-4',
    kind: 'rect',
    center: { x: 3.6, z: 4.2 },
    halfExtents: { x: 0.6, z: 0.6 },
  },
];

export const coffeeShopWorldLayout: WorldLayout = {
  id: 'france-coffee_shop',
  playerStart: [0, 0, 5.4],
  playerStartRotation: Math.PI,
  npcPosition: COFFEE_SHOP_NPC_POSITION,
  bounds: COFFEE_SHOP_BOUNDS,
  colliders: COFFEE_SHOP_COLLIDERS,
  transitTargets: [],
  camera: {
    followOffset: new THREE.Vector3(0, 4.0, 5.6),
    lookOffset: new THREE.Vector3(0, 1.2, -1.2),
    conversationCamera: new THREE.Vector3(0, 1.85, -0.6),
    conversationLook: COFFEE_SHOP_NPC_POSITION.clone().add(new THREE.Vector3(0, 1.55, 0.1)),
  },
  skyColor: '#f5e9d6',
  fogColor: '#e8d8be',
  fogNear: 18,
  fogFar: 56,
};
