import express from 'express';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { Server } from 'socket.io';
import type { PlayerProfileInput, PlayerSnapshot, RoomActionResponse } from '../src/shared/contracts.js';
import { RoomRegistry } from './rooms/RoomRegistry.js';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './rooms/roomEvents.js';
import { roomError } from './rooms/roomTypes.js';

interface ServerOptions {
  host?: string;
  port?: number;
  registry?: RoomRegistry;
}

export function createHuskyMultiplayerServer({ registry = new RoomRegistry() }: ServerOptions = {}) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/],
      },
      maxHttpBufferSize: 32 * 1024,
    },
  );

  app.use(express.json({ limit: '24kb' }));
  app.get('/api/health', (_request, response) => {
    response.json({ ok: true, service: 'huskyhac-multiplayer' });
  });
  app.get('/api/multiplayer/health', (_request, response) => {
    response.json({ ok: true, maxPlayers: 4 });
  });

  io.on('connection', (socket) => {
    function send<T>(ack: ((response: RoomActionResponse<T>) => void) | undefined, response: RoomActionResponse<T>) {
      if (ack) ack(response);
    }

    function leaveCurrentRoom() {
      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;
      if (!roomCode || !playerId) return null;

      const updatedRoom = registry.leaveRoom(roomCode, playerId);
      socket.leave(roomCode);
      socket.data.roomCode = undefined;
      socket.data.playerId = undefined;

      if (updatedRoom) {
        socket.to(roomCode).emit('room:updated', updatedRoom);
      }

      return updatedRoom;
    }

    function enterRoom(profile: PlayerProfileInput, roomCode?: string) {
      leaveCurrentRoom();
      const joined = roomCode ? registry.joinRoom(roomCode, profile) : registry.createRoom(profile);
      socket.join(joined.room.code);
      socket.data.roomCode = joined.room.code;
      socket.data.playerId = joined.self.id;
      io.to(joined.room.code).emit('room:updated', joined.room);
      return joined;
    }

    socket.on('room:create', (profile, ack) => {
      try {
        send(ack, { ok: true, data: enterRoom(profile) });
      } catch (error) {
        send(ack, { ok: false, error: roomError(error) });
      }
    });

    socket.on('room:join', ({ roomCode, profile }, ack) => {
      try {
        send(ack, { ok: true, data: enterRoom(profile, roomCode) });
      } catch (error) {
        send(ack, { ok: false, error: roomError(error) });
      }
    });

    socket.on('room:leave', (ack) => {
      const room = leaveCurrentRoom();
      send(ack, { ok: true, data: { room } });
    });

    socket.on('player:snapshot', (snapshot: PlayerSnapshot) => {
      const roomCode = socket.data.roomCode;
      const playerId = socket.data.playerId;
      if (!roomCode || !playerId) return;

      try {
        const accepted = registry.updateSnapshot(roomCode, { ...snapshot, playerId });
        if (accepted) {
          socket.to(roomCode).volatile.emit('player:snapshot', accepted);
        }
      } catch (error) {
        socket.emit('room:error', roomError(error));
      }
    });

    socket.on('disconnect', () => {
      leaveCurrentRoom();
    });
  });

  return { app, httpServer, io, registry };
}

export async function startServer({ host = '127.0.0.1', port = Number(process.env.PORT ?? 8787) }: ServerOptions = {}) {
  const server = createHuskyMultiplayerServer();
  await new Promise<void>((resolve) => {
    server.httpServer.listen(port, host, resolve);
  });
  console.log(`HuskyHac multiplayer server listening on http://${host}:${port}`);
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
