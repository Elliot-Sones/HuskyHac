import { io, type Socket } from 'socket.io-client';
import type {
  PlayerProfileInput,
  PlayerSnapshot,
  RoomActionResponse,
  RoomError,
  RoomJoinPayload,
  RoomJoinedPayload,
  RoomState,
} from '@/shared/contracts';
import type { MultiplayerTransport, Unsubscribe } from './MultiplayerTransport';

interface ServerToClientEvents {
  'room:updated': (room: RoomState) => void;
  'room:error': (error: RoomError) => void;
  'player:snapshot': (snapshot: PlayerSnapshot) => void;
}

interface ClientToServerEvents {
  'room:create': (profile: PlayerProfileInput, ack: (response: RoomActionResponse<RoomJoinedPayload>) => void) => void;
  'room:join': (payload: RoomJoinPayload, ack: (response: RoomActionResponse<RoomJoinedPayload>) => void) => void;
  'room:leave': (ack: (response: RoomActionResponse<{ room: RoomState | null }>) => void) => void;
  'player:snapshot': (snapshot: PlayerSnapshot) => void;
}

export class SocketIoMultiplayerTransport implements MultiplayerTransport {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  constructor(private readonly url?: string) {}

  async createRoom(profile: PlayerProfileInput) {
    return this.emitCreateRoom(profile);
  }

  async joinRoom(payload: RoomJoinPayload) {
    return this.emitJoinRoom(payload);
  }

  async leaveRoom() {
    const socket = this.ensureSocket();
    await new Promise<void>((resolve) => {
      socket.timeout(1500).emit('room:leave', () => resolve());
    });
  }

  publishSnapshot(snapshot: PlayerSnapshot) {
    const socket = this.socket;
    if (!socket?.connected) return;
    socket.volatile.emit('player:snapshot', snapshot);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onRoomUpdated(listener: (room: RoomState) => void): Unsubscribe {
    const socket = this.ensureSocket();
    socket.on('room:updated', listener);
    return () => socket.off('room:updated', listener);
  }

  onPlayerSnapshot(listener: (snapshot: PlayerSnapshot) => void): Unsubscribe {
    const socket = this.ensureSocket();
    socket.on('player:snapshot', listener);
    return () => socket.off('player:snapshot', listener);
  }

  onRoomError(listener: (error: RoomError) => void): Unsubscribe {
    const socket = this.ensureSocket();
    socket.on('room:error', listener);
    return () => socket.off('room:error', listener);
  }

  private ensureSocket() {
    if (!this.socket) {
      this.socket = io(this.url ?? '/', {
        autoConnect: false,
        transports: ['websocket', 'polling'],
      });
    }
    if (!this.socket.connected) {
      this.socket.connect();
    }
    return this.socket;
  }

  private emitCreateRoom(profile: PlayerProfileInput) {
    const socket = this.ensureSocket();
    return new Promise<RoomJoinedPayload>((resolve, reject) => {
      socket.timeout(4000).emit('room:create', profile, (timeoutError, response) => {
        handleRoomResponse(timeoutError, response, resolve, reject);
      });
    });
  }

  private emitJoinRoom(payload: RoomJoinPayload) {
    const socket = this.ensureSocket();
    return new Promise<RoomJoinedPayload>((resolve, reject) => {
      socket.timeout(4000).emit('room:join', payload, (timeoutError, response) => {
        handleRoomResponse(timeoutError, response, resolve, reject);
      });
    });
  }
}

function handleRoomResponse<T>(
  timeoutError: Error | null,
  response: RoomActionResponse<T> | undefined,
  resolve: (value: T) => void,
  reject: (reason?: unknown) => void,
) {
  if (timeoutError) {
    reject(new Error('Multiplayer server did not respond. Solo mode is still available.'));
    return;
  }
  if (!response) {
    reject(new Error('Multiplayer server returned an empty response.'));
    return;
  }
  if (!response.ok) {
    reject(new Error(response.error.message));
    return;
  }
  resolve(response.data);
}
