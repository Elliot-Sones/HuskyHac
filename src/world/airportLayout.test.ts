import { describe, expect, it } from 'vitest';
import {
  AIRPORT_BOUNDS,
  AIRPORT_COLLIDERS,
  AIRPORT_NPC_POSITION,
  PLAYER_COLLIDER_RADIUS,
} from '@/world/airportLayout';
import { moveCircleWithColliders, pointInsideCollider } from '@/world/physics';

describe('airport physical layout', () => {
  it('keeps the player out of the information desk while still close enough to talk', () => {
    const desk = AIRPORT_COLLIDERS.find((collider) => collider.id === 'information-desk');
    expect(desk).toBeDefined();

    const next = moveCircleWithColliders(
      { x: AIRPORT_NPC_POSITION.x, z: -2.7 },
      { x: 0, z: -1.2 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );

    expect(pointInsideCollider(next, desk!, PLAYER_COLLIDER_RADIUS)).toBe(false);
    expect(Math.hypot(next.x - AIRPORT_NPC_POSITION.x, next.z - AIRPORT_NPC_POSITION.z)).toBeLessThan(3.3);
  });

  it('treats airport props as data-driven physical objects', () => {
    expect(AIRPORT_COLLIDERS.map((collider) => collider.id)).toEqual(
      expect.arrayContaining([
        'terminal-back-wall',
        'information-desk',
        'arrival-board',
        'baggage-carousel',
        'ticket-kiosks',
        'queue-rope-front',
      ]),
    );
  });
});
