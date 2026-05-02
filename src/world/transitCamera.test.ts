import { describe, expect, it } from 'vitest';
import { AIRPORT_COLLIDERS, AIRPORT_TRANSIT_TARGETS } from '@/world/airportLayout';
import { pointInsideCollider } from '@/world/physics';
import { createTransitConversationFocus } from '@/world/transitCamera';

describe('createTransitConversationFocus', () => {
  it('creates a close conversation camera for each transit target', () => {
    for (const target of AIRPORT_TRANSIT_TARGETS) {
      const focus = createTransitConversationFocus(target);

      expect(focus.camera.y).toBeGreaterThan(2);
      expect(focus.camera.z).toBeGreaterThan(target.position.z);
      expect(focus.look.y).toBeGreaterThan(1);
      expect(Number.isFinite(focus.look.x)).toBe(true);
      expect(Number.isFinite(focus.look.z)).toBe(true);
    }
  });

  it('moves the visible taxi rider into the car while focusing the camera on the car', () => {
    const taxi = AIRPORT_TRANSIT_TARGETS.find((target) => target.id === 'taxi');
    const taxiCollider = AIRPORT_COLLIDERS.find((collider) => collider.id === 'outdoor-taxi-left');
    if (!taxi || !taxiCollider) throw new Error('Taxi target or collider is missing.');

    const focus = createTransitConversationFocus(taxi);

    expect(focus.avatarPosition).toBeDefined();
    expect(focus.avatarScale).toBeLessThan(1);
    expect(focus.look.x).toBeLessThan(taxi.position.x);
    expect(pointInsideCollider({ x: focus.avatarPosition!.x, z: focus.avatarPosition!.z }, taxiCollider)).toBe(
      true,
    );
  });
});
