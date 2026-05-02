import * as THREE from 'three';
import type { WorldConversationFocus, WorldTransitTarget } from '@/world/worldLayout';

export function createTransitConversationFocus(target: WorldTransitTarget): WorldConversationFocus {
  if (target.id === 'taxi') {
    const taxiSeat = new THREE.Vector3(-7.05, 0.2, -16.82);

    return {
      camera: taxiSeat.clone().add(new THREE.Vector3(0.35, 2.1, 2.45)),
      look: taxiSeat.clone().add(new THREE.Vector3(0, 0.9, 0)),
      avatarPosition: taxiSeat,
      avatarRotationY: Math.PI / 2,
      avatarScale: 0.52,
    };
  }

  const targetPosition = new THREE.Vector3(target.position.x, 0, target.position.z);

  return {
    camera: targetPosition.clone().add(new THREE.Vector3(0.85, 2.6, 4.2)),
    look: targetPosition.clone().add(new THREE.Vector3(0, 1.25, 0)),
  };
}
