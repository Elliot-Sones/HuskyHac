import type { PlayerSnapshot, SceneMode } from '@/shared/contracts';

export const MULTIPLAYER_SNAPSHOT_INTERVAL_MS = 80;

export interface LocalSnapshotInput {
  playerId: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  walking: boolean;
  running: boolean;
  mode: SceneMode;
}

interface SnapshotPublisherOptions {
  getNow?: () => number;
  publish: (snapshot: PlayerSnapshot) => void;
  intervalMs?: number;
}

export function createSnapshotPublisher({
  getNow = () => performance.now(),
  publish,
  intervalMs = MULTIPLAYER_SNAPSHOT_INTERVAL_MS,
}: SnapshotPublisherOptions) {
  let lastSentAt = -Infinity;
  let sequence = 0;

  return {
    tryPublish(input: LocalSnapshotInput) {
      const now = getNow();
      if (now - lastSentAt < intervalMs) return null;

      sequence += 1;
      lastSentAt = now;

      const snapshot: PlayerSnapshot = {
        playerId: input.playerId,
        sequence,
        sentAt: now,
        position: input.position,
        rotationY: input.rotationY,
        walking: input.walking,
        running: input.running,
        mode: input.mode,
      };

      publish(snapshot);
      return snapshot;
    },
    reset() {
      lastSentAt = -Infinity;
      sequence = 0;
    },
  };
}
