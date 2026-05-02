import type { PlayerSnapshot } from '@/shared/contracts';

export class RemoteSnapshotStore {
  private readonly snapshots = new Map<string, PlayerSnapshot>();

  upsert(snapshot: PlayerSnapshot) {
    const previous = this.snapshots.get(snapshot.playerId);
    if (previous && snapshot.sequence <= previous.sequence) return false;
    this.snapshots.set(snapshot.playerId, snapshot);
    return true;
  }

  remove(playerId: string) {
    this.snapshots.delete(playerId);
  }

  clearExcept(playerIds: Set<string>) {
    for (const playerId of this.snapshots.keys()) {
      if (!playerIds.has(playerId)) this.snapshots.delete(playerId);
    }
  }

  getSnapshot(playerId: string) {
    return this.snapshots.get(playerId) ?? null;
  }

  getAll() {
    return Array.from(this.snapshots.values());
  }
}
