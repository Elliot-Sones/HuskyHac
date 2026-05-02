import { describe, expect, it } from 'vitest';
import { FRANCE_MULTIPLAYER_ROOM_CODE, MULTIPLAYER_MAX_PLAYERS } from '../../src/shared/contracts';
import { RoomRegistry } from './RoomRegistry';

function profile(index: number) {
  return {
    playerToken: `token-${index}-stable`,
    displayName: `Player ${index}`,
    color: '#2563eb',
  };
}

describe('RoomRegistry', () => {
  it('puts every France visitor into one shared room without a visible room code flow', () => {
    const registry = new RoomRegistry();
    const first = registry.joinRoom(FRANCE_MULTIPLAYER_ROOM_CODE, profile(1));
    const second = registry.joinRoom(FRANCE_MULTIPLAYER_ROOM_CODE, profile(2));

    expect(first.room.code).toBe(FRANCE_MULTIPLAYER_ROOM_CODE);
    expect(second.room.code).toBe(FRANCE_MULTIPLAYER_ROOM_CODE);
    expect(second.room.players).toHaveLength(2);
    expect(registry.getRoom(FRANCE_MULTIPLAYER_ROOM_CODE)?.players).toHaveLength(2);
  });

  it('caps rooms at the configured small-room player limit', () => {
    const registry = new RoomRegistry({ roomCodeSeed: () => 'ABCD12' });
    const created = registry.createRoom(profile(1));

    for (let index = 2; index <= MULTIPLAYER_MAX_PLAYERS; index += 1) {
      const joined = registry.joinRoom(created.room.code, profile(index));
      expect(joined.room.players).toHaveLength(index);
    }

    expect(() => registry.joinRoom(created.room.code, profile(5))).toThrow(/room is full/i);
    expect(registry.getRoom(created.room.code)?.players).toHaveLength(MULTIPLAYER_MAX_PLAYERS);
  });

  it('accepts only newer movement snapshots for each player', () => {
    const registry = new RoomRegistry({ roomCodeSeed: () => 'SNAP01' });
    const { self, room } = registry.createRoom(profile(1));

    const first = registry.updateSnapshot(room.code, {
      playerId: self.id,
      sequence: 1,
      sentAt: 100,
      position: { x: 1, y: 0, z: 2 },
      rotationY: 0.5,
      walking: true,
      running: false,
      mode: 'world',
    });
    const stale = registry.updateSnapshot(room.code, {
      ...first,
      sequence: 1,
      position: { x: 99, y: 0, z: 99 },
    });
    const newer = registry.updateSnapshot(room.code, {
      ...first,
      sequence: 2,
      sentAt: 120,
      position: { x: 2, y: 0, z: 3 },
    });

    expect(stale).toBeNull();
    expect(newer?.position).toEqual({ x: 2, y: 0, z: 3 });
    expect(registry.getRoom(room.code)?.snapshots[self.id]?.sequence).toBe(2);
  });

  it('removes empty rooms after the last player leaves', () => {
    const registry = new RoomRegistry({ roomCodeSeed: () => 'LEAVE1' });
    const { self, room } = registry.createRoom(profile(1));

    registry.leaveRoom(room.code, self.id);

    expect(registry.getRoom(room.code)).toBeNull();
  });
});
