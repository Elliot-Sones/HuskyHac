export interface Vec2 {
  x: number;
  z: number;
}

export interface RectCollider {
  id: string;
  kind: 'rect';
  center: Vec2;
  halfExtents: Vec2;
  rotation?: number;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export type WorldCollider = RectCollider;

export function pointInsideCollider(point: Vec2, collider: WorldCollider, radius = 0): boolean {
  const localPoint = toColliderLocal(point, collider);

  return (
    Math.abs(localPoint.x) <= collider.halfExtents.x + radius &&
    Math.abs(localPoint.z) <= collider.halfExtents.z + radius
  );
}

export function moveCircleWithColliders(
  current: Vec2,
  delta: Vec2,
  radius: number,
  colliders: WorldCollider[],
  bounds?: WorldBounds,
): Vec2 {
  const desired = constrainToBounds(add(current, delta), radius, bounds);
  if (!collides(desired, radius, colliders)) {
    return desired;
  }

  const xOnly = constrainToBounds({ x: current.x + delta.x, z: current.z }, radius, bounds);
  const zOnly = constrainToBounds({ x: current.x, z: current.z + delta.z }, radius, bounds);
  const canMoveX = !collides(xOnly, radius, colliders);
  const canMoveZ = !collides(zOnly, radius, colliders);

  if (canMoveX && canMoveZ) {
    return Math.abs(delta.x) <= Math.abs(delta.z) ? xOnly : zOnly;
  }

  if (canMoveX) {
    return xOnly;
  }

  if (canMoveZ) {
    return zOnly;
  }

  return constrainToBounds(current, radius, bounds);
}

function collides(point: Vec2, radius: number, colliders: WorldCollider[]): boolean {
  return colliders.some((collider) => pointInsideCollider(point, collider, radius));
}

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, z: a.z + b.z };
}

function constrainToBounds(point: Vec2, radius: number, bounds?: WorldBounds): Vec2 {
  if (!bounds) {
    return point;
  }

  return {
    x: clamp(point.x, bounds.minX + radius, bounds.maxX - radius),
    z: clamp(point.z, bounds.minZ + radius, bounds.maxZ - radius),
  };
}

function toColliderLocal(point: Vec2, collider: RectCollider): Vec2 {
  const translated = {
    x: point.x - collider.center.x,
    z: point.z - collider.center.z,
  };
  const rotation = collider.rotation ?? 0;

  if (rotation === 0) {
    return translated;
  }

  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);

  return {
    x: translated.x * cos - translated.z * sin,
    z: translated.x * sin + translated.z * cos,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
