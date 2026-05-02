import { describe, expect, it } from 'vitest';
import { RemoteSnapshotStore } from './remoteSnapshotStore';

describe('RemoteSnapshotStore', () => {
  it('keeps remote snapshot ingestion out of React state and rejects stale sequences', () => {
    const store = new RemoteSnapshotStore();

    store.upsert({
      playerId: 'remote-1',
      sequence: 2,
      sentAt: 100,
      position: { x: 1, y: 0, z: 1 },
      rotationY: 0,
      walking: true,
      running: false,
      mode: 'world',
    });
    store.upsert({
      playerId: 'remote-1',
      sequence: 1,
      sentAt: 150,
      position: { x: 99, y: 0, z: 99 },
      rotationY: 0,
      walking: false,
      running: false,
      mode: 'world',
    });

    expect(store.getSnapshot('remote-1')?.position).toEqual({ x: 1, y: 0, z: 1 });
    expect(store.getAll()).toHaveLength(1);
  });

  it('prunes disconnected players from the external snapshot store', () => {
    const store = new RemoteSnapshotStore();

    store.upsert({
      playerId: 'remote-1',
      sequence: 1,
      sentAt: 100,
      position: { x: 1, y: 0, z: 1 },
      rotationY: 0,
      walking: false,
      running: false,
      mode: 'world',
    });
    store.remove('remote-1');

    expect(store.getSnapshot('remote-1')).toBeNull();
    expect(store.getAll()).toEqual([]);
  });
});
