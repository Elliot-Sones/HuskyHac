import * as THREE from 'three';
import type { WorldBounds, WorldCollider } from '@/world/physics';

export const PLAYER_COLLIDER_RADIUS = 0.42;

export const AIRPORT_NPC_POSITION = new THREE.Vector3(4.7, 0, -4.55);

export const AIRPORT_BOUNDS: WorldBounds = {
  minX: -15,
  maxX: 13,
  minZ: -8.5,
  maxZ: 12,
};

export const AIRPORT_COLLIDERS: WorldCollider[] = [
  {
    id: 'terminal-back-wall',
    kind: 'rect',
    center: { x: 0, z: -10.5 },
    halfExtents: { x: 22, z: 0.24 },
  },
  {
    id: 'information-desk',
    kind: 'rect',
    center: { x: 4.7, z: -4.2 },
    halfExtents: { x: 4.12, z: 0.92 },
  },
  {
    id: 'arrival-board',
    kind: 'rect',
    center: { x: -12.5, z: -6.4 },
    halfExtents: { x: 3.25, z: 0.42 },
    rotation: 0.08,
  },
  {
    id: 'baggage-carousel',
    kind: 'rect',
    center: { x: -12.2, z: 3.2 },
    halfExtents: { x: 2.65, z: 0.95 },
    rotation: -0.3,
  },
  {
    id: 'ticket-kiosks',
    kind: 'rect',
    center: { x: 10.9, z: 3.2 },
    halfExtents: { x: 1.95, z: 0.58 },
    rotation: -0.3,
  },
  {
    id: 'queue-rope-front',
    kind: 'rect',
    center: { x: 1.5, z: -2.4 },
    halfExtents: { x: 1.82, z: 0.14 },
  },
  {
    id: 'queue-rope-back',
    kind: 'rect',
    center: { x: 1.5, z: -0.5 },
    halfExtents: { x: 1.82, z: 0.14 },
  },
  {
    id: 'left-floor-suitcase',
    kind: 'rect',
    center: { x: -1.4, z: 2.8 },
    halfExtents: { x: 0.34, z: 0.26 },
  },
  {
    id: 'center-floor-suitcase',
    kind: 'rect',
    center: { x: -0.8, z: 3.25 },
    halfExtents: { x: 0.34, z: 0.26 },
  },
  {
    id: 'right-floor-suitcase',
    kind: 'rect',
    center: { x: 1.6, z: 4.2 },
    halfExtents: { x: 0.34, z: 0.26 },
  },
];
