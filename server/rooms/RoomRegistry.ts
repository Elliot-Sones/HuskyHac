import { randomUUID } from 'node:crypto';
import {
  MULTIPLAYER_MAX_PLAYERS,
  MULTIPLAYER_ROOM_CODE_LENGTH,
  type PlayerProfileInput,
  type PlayerSnapshot,
  type RoomState,
} from '../../src/shared/contracts.js';
import { normalizeProfile, normalizeRoomCode, validateSnapshot } from './roomValidation.js';
import {
  type JoinResult,
  type RoomRecord,
  RoomRegistryError,
  type RoomRegistryOptions,
  serializeRoom,
} from './roomTypes.js';

const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class RoomRegistry {
  private readonly rooms = new Map<string, RoomRecord>();
  private readonly roomCodeSeed: () => string;
  private readonly getNow: () => number;
  private readonly createId: () => string;

  constructor(options: RoomRegistryOptions = {}) {
    this.roomCodeSeed = options.roomCodeSeed ?? createRoomCode;
    this.getNow = options.getNow ?? Date.now;
    this.createId = options.createId ?? randomUUID;
  }

  createRoom(profileInput: PlayerProfileInput): JoinResult {
    const room = this.createRoomRecord();
    this.rooms.set(room.code, room);
    return this.addOrUpdatePlayer(room, profileInput);
  }

  joinRoom(roomCode: string, profileInput: PlayerProfileInput): JoinResult {
    const code = normalizeRoomCode(roomCode);
    const room = this.rooms.get(code);
    if (!room) {
      throw new RoomRegistryError('ROOM_NOT_FOUND', 'Room not found.');
    }
    return this.addOrUpdatePlayer(room, profileInput);
  }

  leaveRoom(roomCode: string, playerId: string): RoomState | null {
    const code = normalizeRoomCode(roomCode);
    const room = this.rooms.get(code);
    if (!room) return null;

    room.players.delete(playerId);
    room.snapshots.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(code);
      return null;
    }

    return serializeRoom(room);
  }

  updateSnapshot(roomCode: string, snapshot: PlayerSnapshot): PlayerSnapshot | null {
    const code = normalizeRoomCode(roomCode);
    const room = this.rooms.get(code);
    if (!room) {
      throw new RoomRegistryError('ROOM_NOT_FOUND', 'Room not found.');
    }
    if (!room.players.has(snapshot.playerId)) {
      throw new RoomRegistryError('NOT_IN_ROOM', 'Player is not in this room.');
    }

    validateSnapshot(snapshot);
    const previous = room.snapshots.get(snapshot.playerId);
    if (previous && snapshot.sequence <= previous.sequence) {
      return null;
    }

    room.snapshots.set(snapshot.playerId, snapshot);
    return snapshot;
  }

  getRoom(roomCode: string): RoomState | null {
    const code = normalizeRoomCode(roomCode);
    const room = this.rooms.get(code);
    return room ? serializeRoom(room) : null;
  }

  private createRoomRecord(): RoomRecord {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = normalizeRoomCode(this.roomCodeSeed());
      if (!this.rooms.has(code)) {
        return {
          id: this.createId(),
          code,
          createdAt: this.getNow(),
          maxPlayers: MULTIPLAYER_MAX_PLAYERS,
          players: new Map(),
          snapshots: new Map(),
        };
      }
    }
    throw new RoomRegistryError('INVALID_ROOM', 'Could not allocate a room code.');
  }

  private addOrUpdatePlayer(room: RoomRecord, profileInput: PlayerProfileInput): JoinResult {
    const profile = normalizeProfile(profileInput, room.players.size);
    const existing = Array.from(room.players.values()).find((player) => player.playerToken === profile.playerToken);

    if (!existing && room.players.size >= MULTIPLAYER_MAX_PLAYERS) {
      throw new RoomRegistryError('ROOM_FULL', 'This room is full.');
    }

    const player = existing ?? {
      id: this.createId(),
      roomId: room.id,
      playerToken: profile.playerToken,
      joinedAt: this.getNow(),
      displayName: profile.displayName,
      color: profile.color,
      accessory: profile.accessory,
      connected: true,
    };

    player.displayName = profile.displayName;
    player.color = profile.color;
    player.accessory = profile.accessory;
    player.connected = true;
    room.players.set(player.id, player);

    const { playerToken: _playerToken, joinedAt: _joinedAt, ...serializedPlayer } = player;
    return { room: serializeRoom(room), self: serializedPlayer };
  }
}

function createRoomCode() {
  let code = '';
  for (let index = 0; index < MULTIPLAYER_ROOM_CODE_LENGTH; index += 1) {
    code += codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)];
  }
  return code;
}
