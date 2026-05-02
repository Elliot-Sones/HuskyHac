import type {
  PlayerProfileInput,
  PlayerSnapshot,
  RoomActionResponse,
  RoomError,
  RoomJoinPayload,
  RoomJoinedPayload,
  RoomState,
} from '../../src/shared/contracts.js';

export type RoomAck<T> = (response: RoomActionResponse<T>) => void;

export interface ClientToServerEvents {
  'room:create': (profile: PlayerProfileInput, ack: RoomAck<RoomJoinedPayload>) => void;
  'room:join': (payload: RoomJoinPayload, ack: RoomAck<RoomJoinedPayload>) => void;
  'room:leave': (ack?: RoomAck<{ room: RoomState | null }>) => void;
  'player:snapshot': (snapshot: PlayerSnapshot) => void;
}

export interface ServerToClientEvents {
  'room:updated': (room: RoomState) => void;
  'room:error': (error: RoomError) => void;
  'player:snapshot': (snapshot: PlayerSnapshot) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomCode?: string;
  playerId?: string;
}
