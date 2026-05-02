import * as THREE from 'three';
import type { WorldConversationFocus, WorldTransitTarget } from '@/world/worldLayout';

export function createTransitConversationFocus(target: WorldTransitTarget): WorldConversationFocus {
  if (target.id === 'taxi') {
    const taxiSeat = new THREE.Vector3(-7.05, 0.42, -16.82);

    return {
      camera: taxiSeat.clone().add(new THREE.Vector3(0.45, 1.8, 2.85)),
      look: taxiSeat.clone().add(new THREE.Vector3(0, 0.3, 0)),
      avatarPosition: taxiSeat,
      avatarRotationY: Math.PI / 2,
      avatarScale: 0.62,
    };
  }

  const targetPosition = new THREE.Vector3(target.position.x, 0, target.position.z);

  return {
    camera: targetPosition.clone().add(new THREE.Vector3(0.85, 2.6, 4.2)),
    look: targetPosition.clone().add(new THREE.Vector3(0, 1.25, 0)),
  };
}
