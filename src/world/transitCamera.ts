import * as THREE from 'three';
import type { WorldConversationFocus, WorldTransitTarget } from '@/world/worldLayout';

export function createTransitConversationFocus(target: WorldTransitTarget): WorldConversationFocus {
  if (target.id === 'taxi') {
    const taxiSeat = new THREE.Vector3(-7.72, 0.16, -16.82);

    return {
      view: 'taxiInterior',
      camera: taxiSeat.clone().add(new THREE.Vector3(0.05, 1.02, 0.18)),
      look: taxiSeat.clone().add(new THREE.Vector3(1.45, 0.86, -0.05)),
      avatarPosition: taxiSeat,
      avatarRotationY: Math.PI / 2,
      avatarScale: 0.48,
    };
  }

  const targetPosition = new THREE.Vector3(target.position.x, 0, target.position.z);

  return {
    camera: targetPosition.clone().add(new THREE.Vector3(0.85, 2.6, 4.2)),
    look: targetPosition.clone().add(new THREE.Vector3(0, 1.25, 0)),
  };
}
