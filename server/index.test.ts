import { type AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { io, type Socket } from 'socket.io-client';
import type { RoomActionResponse, RoomJoinedPayload } from '../src/shared/contracts';
import { createHuskyMultiplayerServer } from './index.js';

const sockets: Socket[] = [];
const servers: Array<ReturnType<typeof createHuskyMultiplayerServer>> = [];

describe('HuskyHac multiplayer Socket.IO gateway', () => {
  afterEach(async () => {
    sockets.splice(0).forEach((socket) => socket.disconnect());
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve) => {
            server.io.close();
            server.httpServer.close(() => resolve());
          }),
      ),
    );
  });

  it('creates a small room, joins a second player, and fans out newer snapshots', async () => {
    const server = createHuskyMultiplayerServer();
    servers.push(server);
    const url = await listen(server.httpServer);
    const first = connect(url);
    const second = connect(url);

    const created = await emitAck<RoomJoinedPayload>(first, 'room:create', {
      playerToken: 'token-first-stable',
      displayName: 'Avery',
      color: '#2563eb',
      accessory: 'backpack',
    });
    const joined = await emitAck<RoomJoinedPayload>(second, 'room:join', {
      roomCode: created.room.code,
      profile: {
        playerToken: 'token-second-stable',
        displayName: 'Blake',
        color: '#16a34a',
        accessory: 'suitcase',
      },
    });

    const remoteSnapshot = new Promise((resolve) => {
      second.once('player:snapshot', resolve);
    });

    first.emit('player:snapshot', {
      playerId: created.self.id,
      sequence: 1,
      sentAt: 100,
      position: { x: 4, y: 0, z: 8 },
      rotationY: 0.25,
      walking: true,
      running: false,
      mode: 'world',
    });

    await expect(remoteSnapshot).resolves.toMatchObject({
      playerId: created.self.id,
      sequence: 1,
      position: { x: 4, y: 0, z: 8 },
    });
    expect(joined.room.players).toHaveLength(2);
  });
});

async function listen(httpServer: ReturnType<typeof createHuskyMultiplayerServer>['httpServer']) {
  await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const address = httpServer.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function connect(url: string) {
  const socket = io(url, {
    forceNew: true,
    transports: ['websocket'],
  });
  sockets.push(socket);
  return socket;
}

function emitAck<T>(socket: Socket, event: 'room:create' | 'room:join', payload: unknown) {
  return new Promise<T>((resolve, reject) => {
    socket.timeout(2000).emit(event, payload, (error: Error | null, response?: RoomActionResponse<T>) => {
      if (error) {
        reject(error);
        return;
      }
      if (!response) {
        reject(new Error('Missing response.'));
        return;
      }
      if (!response.ok) {
        reject(new Error(response.error.message));
        return;
      }
      resolve(response.data);
    });
  });
}
