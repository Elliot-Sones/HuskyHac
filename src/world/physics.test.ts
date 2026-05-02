import { describe, expect, it } from 'vitest';
import {
  moveCircleWithColliders,
  pointInsideCollider,
  type RectCollider,
} from '@/world/physics';

const wall: RectCollider = {
  id: 'test-wall',
  kind: 'rect',
  center: { x: 0, z: 0 },
  halfExtents: { x: 1, z: 1 },
};

describe('world collision helpers', () => {
  it('keeps the player circle outside solid rectangles', () => {
    const next = moveCircleWithColliders(
      { x: -2.2, z: 0 },
      { x: 2, z: 0 },
      0.42,
      [wall],
    );

    expect(next.x).toBeLessThanOrEqual(-1.42);
    expect(pointInsideCollider(next, wall, 0.42)).toBe(false);
  });

  it('slides along the obstacle when only one movement axis is blocked', () => {
    const next = moveCircleWithColliders(
      { x: -2.2, z: 1.7 },
      { x: 2, z: -0.9 },
      0.42,
      [wall],
    );

    expect(next.x).toBeCloseTo(-2.2, 5);
    expect(next.z).toBeCloseTo(0.8, 5);
  });

  it('allows adding new obstacle definitions without changing player code', () => {
    const kiosk: RectCollider = {
      id: 'kiosk',
      kind: 'rect',
      center: { x: 5, z: 4 },
      halfExtents: { x: 0.65, z: 0.45 },
    };

    const next = moveCircleWithColliders(
      { x: 5, z: 5.4 },
      { x: 0, z: -2 },
      0.42,
      [kiosk],
    );

    expect(next.z).toBeGreaterThanOrEqual(4.87);
    expect(pointInsideCollider(next, kiosk, 0.42)).toBe(false);
  });
});
