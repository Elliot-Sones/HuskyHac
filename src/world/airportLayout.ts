import * as THREE from 'three';
import type { WorldBounds, WorldCollider } from '@/world/physics';
import type { WorldLayout, WorldTransitTarget } from '@/world/worldLayout';

export const PLAYER_COLLIDER_RADIUS = 0.42;

export const AIRPORT_NPC_POSITION = new THREE.Vector3(4.7, 0, -4.55);

export type AirportTransitTargetId = 'taxi' | 'bus';

export type AirportTransitTarget = WorldTransitTarget & { id: AirportTransitTargetId };

export const AIRPORT_BOUNDS: WorldBounds = {
  minX: -17,
  maxX: 15,
  minZ: -31,
  maxZ: 12,
};

export const AIRPORT_COLLIDERS: WorldCollider[] = [
  {
    id: 'terminal-back-wall-left',
    kind: 'rect',
    center: { x: -11.8, z: -10.5 },
    halfExtents: { x: 4.3, z: 0.24 },
  },
  {
    id: 'terminal-back-wall-right',
    kind: 'rect',
    center: { x: 5.6, z: -10.5 },
    halfExtents: { x: 8.5, z: 0.24 },
  },
  {
    id: 'terminal-left-wall',
    kind: 'rect',
    center: { x: -16.1, z: 1 },
    halfExtents: { x: 0.25, z: 11.7 },
  },
  {
    id: 'terminal-right-wall',
    kind: 'rect',
    center: { x: 14.1, z: 1 },
    halfExtents: { x: 0.25, z: 11.7 },
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
  {
    id: 'outdoor-taxi-left',
    kind: 'rect',
    center: { x: -8.0, z: -16.8 },
    halfExtents: { x: 1.0, z: 0.78 },
  },
  {
    id: 'outdoor-taxi-right',
    kind: 'rect',
    center: { x: -1.9, z: -16.8 },
    halfExtents: { x: 1.0, z: 0.78 },
  },
  {
    id: 'bus-stop-bus',
    kind: 'rect',
    center: { x: -9.2, z: -29.2 },
    halfExtents: { x: 2.0, z: 0.78 },
  },
  {
    id: 'bus-stop-shelter',
    kind: 'rect',
    center: { x: -1.9, z: -29.2 },
    halfExtents: { x: 0.72, z: 0.38 },
  },
];

export const AIRPORT_TRANSIT_TARGETS: AirportTransitTarget[] = [
  {
    id: 'taxi',
    label: 'Taxi stand',
    actionLabel: 'Enter taxi',
    locationLabel: 'Curbside pickup',
    position: { x: -5.2, z: -16.8 },
    radius: 2.0,
  },
  {
    id: 'bus',
    label: 'Bus stop',
    actionLabel: 'Board bus',
    locationLabel: 'Across the street',
    position: { x: -5.2, z: -28.5 },
    radius: 4.0,
  },
];

export const airportWorldLayout: WorldLayout = {
  id: 'airport-france',
  playerStart: [0, 0, 8.6],
  playerStartRotation: Math.PI,
  npcPosition: AIRPORT_NPC_POSITION,
  bounds: AIRPORT_BOUNDS,
  colliders: AIRPORT_COLLIDERS,
  transitTargets: AIRPORT_TRANSIT_TARGETS,
  camera: {
    followOffset: new THREE.Vector3(0, 4.7, 7.4),
    lookOffset: new THREE.Vector3(0, 1.25, -0.6),
    outdoorFollowOffset: new THREE.Vector3(0, 4.5, 3.4),
    outdoorLookOffset: new THREE.Vector3(0, 1.15, -0.25),
    outdoorThresholdZ: -11,
    conversationCamera: new THREE.Vector3(4.5, 2.45, 2.35),
    conversationLook: AIRPORT_NPC_POSITION.clone().add(new THREE.Vector3(0, 1.55, 0.2)),
  },
  skyColor: '#dfe8f2',
  fogColor: '#dfe8f2',
  fogNear: 24,
  fogFar: 66,
};
