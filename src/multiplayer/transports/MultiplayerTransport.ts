import type {
  PlayerProfileInput,
  PlayerSnapshot,
  RoomError,
  RoomJoinPayload,
  RoomJoinedPayload,
  RoomState,
} from '@/shared/contracts';

export type Unsubscribe = () => void;

export interface MultiplayerTransport {
  createRoom(profile: PlayerProfileInput): Promise<RoomJoinedPayload>;
  joinRoom(payload: RoomJoinPayload): Promise<RoomJoinedPayload>;
  leaveRoom(): Promise<void>;
  publishSnapshot(snapshot: PlayerSnapshot): void;
  disconnect(): void;
  onRoomUpdated(listener: (room: RoomState) => void): Unsubscribe;
  onPlayerSnapshot(listener: (snapshot: PlayerSnapshot) => void): Unsubscribe;
  onRoomError(listener: (error: RoomError) => void): Unsubscribe;
}
