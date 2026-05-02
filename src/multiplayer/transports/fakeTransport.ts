import type {
  PlayerProfileInput,
  PlayerSnapshot,
  RoomError,
  RoomJoinPayload,
  RoomJoinedPayload,
  RoomState,
} from '@/shared/contracts';
import type { MultiplayerTransport, Unsubscribe } from './MultiplayerTransport';

export class FakeMultiplayerTransport implements MultiplayerTransport {
  async createRoom(_profile: PlayerProfileInput): Promise<RoomJoinedPayload> {
    throw new Error('Multiplayer is disabled.');
  }

  async joinRoom(_payload: RoomJoinPayload): Promise<RoomJoinedPayload> {
    throw new Error('Multiplayer is disabled.');
  }

  async leaveRoom() {}

  publishSnapshot(_snapshot: PlayerSnapshot) {}

  disconnect() {}

  onRoomUpdated(_listener: (room: RoomState) => void): Unsubscribe {
    return () => {};
  }

  onPlayerSnapshot(_listener: (snapshot: PlayerSnapshot) => void): Unsubscribe {
    return () => {};
  }

  onRoomError(_listener: (error: RoomError) => void): Unsubscribe {
    return () => {};
  }
}
