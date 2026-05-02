import { describe, expect, it } from 'vitest';
import {
  AIRPORT_BOUNDS,
  AIRPORT_COLLIDERS,
  AIRPORT_NPC_POSITION,
  AIRPORT_TRANSIT_TARGETS,
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
        'terminal-left-wall',
        'terminal-right-wall',
        'terminal-back-wall-left',
        'terminal-back-wall-right',
        'information-desk',
        'arrival-board',
        'baggage-carousel',
        'ticket-kiosks',
        'queue-rope-front',
      ]),
    );
  });

  it('blocks the solid side walls', () => {
    const blockedBySideWall = moveCircleWithColliders(
      { x: 13.7, z: 1.5 },
      { x: 2, z: 0 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );

    expect(blockedBySideWall.x).toBeLessThan(14);
  });

  it('keeps the rear taxi doorway open while the rest of the back wall blocks movement', () => {
    const blockedByBackWall = moveCircleWithColliders(
      { x: 3.8, z: -9.2 },
      { x: 0, z: -2.8 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );
    const throughRearTaxiDoor = moveCircleWithColliders(
      { x: -5.2, z: -9.2 },
      { x: 0, z: -2.8 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );

    expect(blockedByBackWall.z).toBeGreaterThan(-10.2);
    expect(throughRearTaxiDoor.z).toBeLessThan(-11.2);
  });

  it('treats the outdoor taxi and bus objects as normal physical obstacles', () => {
    expect(AIRPORT_COLLIDERS.map((collider) => collider.id)).toEqual(
      expect.arrayContaining([
        'outdoor-taxi-left',
        'outdoor-taxi-right',
        'bus-stop-bus',
        'bus-stop-shelter',
      ]),
    );
  });

  it('lets the player cross the street to the bus stop while parked vehicles block shortcuts', () => {
    const openCrosswalk = moveCircleWithColliders(
      { x: -5.2, z: -17.2 },
      { x: 0, z: -9.4 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );
    const blockedByTaxi = moveCircleWithColliders(
      { x: -5.2, z: -16.8 },
      { x: -2.2, z: 0 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );
    const blockedByBus = moveCircleWithColliders(
      { x: -6.2, z: -29.2 },
      { x: -4.4, z: 0 },
      PLAYER_COLLIDER_RADIUS,
      AIRPORT_COLLIDERS,
      AIRPORT_BOUNDS,
    );

    expect(openCrosswalk.z).toBeLessThan(-25.5);
    expect(blockedByTaxi.x).toBeGreaterThan(-6.7);
    expect(blockedByBus.x).toBeGreaterThan(-6.8);
  });

  it('places taxi and bus interaction targets in reachable outdoor spaces', () => {
    expect(AIRPORT_TRANSIT_TARGETS.map((target) => target.id)).toEqual(['taxi', 'bus']);

    for (const target of AIRPORT_TRANSIT_TARGETS) {
      expect(
        AIRPORT_COLLIDERS.some((collider) =>
          pointInsideCollider(target.position, collider, PLAYER_COLLIDER_RADIUS),
        ),
      ).toBe(false);
    }
  });
});
