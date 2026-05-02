import * as THREE from 'three';
import type { WorldConversationFocus, WorldTransitTarget } from '@/world/worldLayout';

export function createTransitConversationFocus(target: WorldTransitTarget): WorldConversationFocus {
  if (target.id === 'taxi') {
    const taxiSeat = new THREE.Vector3(-8.7, 0.16, -16.5);

    return {
      view: 'taxiInterior',
      camera: taxiSeat.clone().add(new THREE.Vector3(0, 1.02, 0)),
      look: taxiSeat.clone().add(new THREE.Vector3(1.8, 0.79, 0.1)),
      avatarPosition: taxiSeat,
      avatarRotationY: -Math.PI / 2,
      avatarScale: 0.48,
    };
  }

  const targetPosition = new THREE.Vector3(target.position.x, 0, target.position.z);

  return {
    camera: targetPosition.clone().add(new THREE.Vector3(0.85, 2.6, 4.2)),
    look: targetPosition.clone().add(new THREE.Vector3(0, 1.25, 0)),
  };
}
