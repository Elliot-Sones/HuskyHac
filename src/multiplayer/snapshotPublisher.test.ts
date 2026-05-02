import { describe, expect, it } from 'vitest';
import {
  createSnapshotPublisher,
  MULTIPLAYER_SNAPSHOT_INTERVAL_MS,
} from './snapshotPublisher';

describe('createSnapshotPublisher', () => {
  it('throttles local player snapshots to a scalable small-room rate', () => {
    const sent: number[] = [];
    const publisher = createSnapshotPublisher({
      getNow: () => sent.length * 10,
      publish: (snapshot) => sent.push(snapshot.sequence),
    });

    for (let frame = 0; frame < 12; frame += 1) {
      publisher.tryPublish({
        playerId: 'local',
        position: { x: frame, y: 0, z: 0 },
        rotationY: 0,
        walking: true,
        running: false,
        mode: 'world',
      });
    }

    expect(sent.length).toBeLessThanOrEqual(Math.ceil(120 / MULTIPLAYER_SNAPSHOT_INTERVAL_MS));
    expect(sent).toEqual([1]);
  });

  it('increments the monotonic sequence only when a snapshot is sent', () => {
    let now = 0;
    const sent: number[] = [];
    const publisher = createSnapshotPublisher({
      getNow: () => now,
      publish: (snapshot) => sent.push(snapshot.sequence),
    });

    publisher.tryPublish({
      playerId: 'local',
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      walking: false,
      running: false,
      mode: 'world',
    });
    publisher.tryPublish({
      playerId: 'local',
      position: { x: 1, y: 0, z: 0 },
      rotationY: 0,
      walking: true,
      running: false,
      mode: 'world',
    });
    now = MULTIPLAYER_SNAPSHOT_INTERVAL_MS;
    publisher.tryPublish({
      playerId: 'local',
      position: { x: 2, y: 0, z: 0 },
      rotationY: 0.5,
      walking: true,
      running: false,
      mode: 'world',
    });

    expect(sent).toEqual([1, 2]);
  });
});
