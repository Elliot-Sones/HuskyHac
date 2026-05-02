import type {
  PlayerProfile,
  PlayerProfileInput,
  PlayerSnapshot,
  RoomError,
  RoomJoinedPayload,
  RoomState,
} from '../../src/shared/contracts.js';

export interface RoomRegistryOptions {
  roomCodeSeed?: () => string;
  getNow?: () => number;
  createId?: () => string;
}

export interface RoomPlayerRecord extends PlayerProfile {
  playerToken: string;
  joinedAt: number;
}

export interface RoomRecord {
  id: string;
  code: string;
  createdAt: number;
  maxPlayers: number;
  players: Map<string, RoomPlayerRecord>;
  snapshots: Map<string, PlayerSnapshot>;
}

export interface JoinResult extends RoomJoinedPayload {}

export interface NormalizedProfileInput extends Required<PlayerProfileInput> {}

export class RoomRegistryError extends Error {
  readonly code: RoomError['code'];

  constructor(code: RoomError['code'], message: string) {
    super(message);
    this.name = 'RoomRegistryError';
    this.code = code;
  }
}

export function roomError(error: unknown): RoomError {
  if (error instanceof RoomRegistryError) {
    return { code: error.code, message: error.message };
  }
  return { code: 'INVALID_ROOM', message: 'Unexpected multiplayer room error.' };
}

export function serializeRoom(record: RoomRecord): RoomState {
  return {
    id: record.id,
    code: record.code,
    createdAt: record.createdAt,
    maxPlayers: record.maxPlayers,
    players: Array.from(record.players.values()).map(({ playerToken: _token, joinedAt: _joinedAt, ...player }) => player),
    snapshots: Object.fromEntries(record.snapshots.entries()),
  };
}
