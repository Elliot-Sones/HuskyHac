import * as THREE from 'three';
import type { WorldConversationFocus, WorldTransitTarget } from '@/world/worldLayout';

export function createTransitConversationFocus(target: WorldTransitTarget): WorldConversationFocus {
  const targetPosition = new THREE.Vector3(target.position.x, 0, target.position.z);

  return {
    camera: targetPosition.clone().add(new THREE.Vector3(0.85, 2.6, 4.2)),
    look: targetPosition.clone().add(new THREE.Vector3(0, 1.25, 0)),
  };
}
