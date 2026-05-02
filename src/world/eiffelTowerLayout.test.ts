import { describe, expect, it } from 'vitest';
import {
  EIFFEL_TOWER_BOUNDS,
  EIFFEL_TOWER_COLLIDERS,
  EIFFEL_TOWER_NPC_POSITION,
  EIFFEL_TOWER_TRANSIT_TARGETS,
} from '@/world/eiffelTowerLayout';
import { PLAYER_COLLIDER_RADIUS } from '@/world/airportLayout';
import { moveCircleWithColliders, pointInsideCollider } from '@/world/physics';

describe('eiffel tower physical layout', () => {
  it('keeps the guide reachable without letting the player walk through the ticket kiosk', () => {
    const kiosk = EIFFEL_TOWER_COLLIDERS.find((collider) => collider.id === 'ticket-kiosk');
    expect(kiosk).toBeDefined();

    const next = moveCircleWithColliders(
      { x: EIFFEL_TOWER_NPC_POSITION.x - 2.2, z: EIFFEL_TOWER_NPC_POSITION.z + 0.9 },
      { x: 2.0, z: -0.4 },
      PLAYER_COLLIDER_RADIUS,
      EIFFEL_TOWER_COLLIDERS,
      EIFFEL_TOWER_BOUNDS,
    );

    expect(pointInsideCollider(next, kiosk!, PLAYER_COLLIDER_RADIUS)).toBe(false);
    expect(Math.hypot(next.x - EIFFEL_TOWER_NPC_POSITION.x, next.z - EIFFEL_TOWER_NPC_POSITION.z)).toBeLessThan(3.3);
  });

  it('treats tower legs, plaza objects, and river railings as data-driven colliders', () => {
    expect(EIFFEL_TOWER_COLLIDERS.map((collider) => collider.id)).toEqual(
      expect.arrayContaining([
        'north-west-tower-leg',
        'north-east-tower-leg',
        'south-west-tower-leg',
        'south-east-tower-leg',
        'ticket-kiosk',
        'souvenir-stand',
        'fountain-basin',
        'seine-railing-left',
      ]),
    );
  });

  it('blocks the tower legs while leaving the center lift queue reachable', () => {
    const blockedByLeg = moveCircleWithColliders(
      { x: -4.35, z: -6.0 },
      { x: 0, z: -5.0 },
      PLAYER_COLLIDER_RADIUS,
      EIFFEL_TOWER_COLLIDERS,
      EIFFEL_TOWER_BOUNDS,
    );
    const openLiftQueue = moveCircleWithColliders(
      { x: 0, z: -1.5 },
      { x: 0, z: -5.0 },
      PLAYER_COLLIDER_RADIUS,
      EIFFEL_TOWER_COLLIDERS,
      EIFFEL_TOWER_BOUNDS,
    );

    expect(blockedByLeg.z).toBeGreaterThan(-9.4);
    expect(openLiftQueue.z).toBeLessThan(-5.8);
  });

  it('places Eiffel transit targets in reachable open plaza spaces', () => {
    expect(EIFFEL_TOWER_TRANSIT_TARGETS.map((target) => target.id)).toEqual([
      'summit-lift',
      'seine-walk',
    ]);

    for (const target of EIFFEL_TOWER_TRANSIT_TARGETS) {
      expect(
        EIFFEL_TOWER_COLLIDERS.some((collider) =>
          pointInsideCollider(target.position, collider, PLAYER_COLLIDER_RADIUS),
        ),
      ).toBe(false);
    }
  });
});
