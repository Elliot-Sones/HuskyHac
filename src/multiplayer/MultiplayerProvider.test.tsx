/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiplayerProvider, useMultiplayer } from '@/multiplayer/MultiplayerProvider';
import type { RoomJoinPayload, RoomState } from '@/shared/contracts';

const mocks = vi.hoisted(() => ({
  joinPayloads: [] as RoomJoinPayload[],
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('@/multiplayer/transports/socketIoTransport', () => ({
  SocketIoMultiplayerTransport: class {
    onRoomUpdated() {
      return () => {};
    }

    onPlayerSnapshot() {
      return () => {};
    }

    onRoomError() {
      return () => {};
    }

    async joinRoom(payload: RoomJoinPayload) {
      mocks.joinPayloads.push(payload);
      const room: RoomState = {
        id: 'room-france',
        code: payload.roomCode,
        createdAt: 1,
        maxPlayers: 4,
        players: [
          {
            id: 'self',
            roomId: 'room-france',
            displayName: payload.profile.displayName,
            color: payload.profile.color,
            accessory: payload.profile.accessory ?? 'backpack',
            connected: true,
          },
        ],
        snapshots: {},
      };
      return { room, self: room.players[0] };
    }

    disconnect() {}
  },
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: makeStorage(),
  });
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: makeStorage(),
  });
  mocks.joinPayloads.length = 0;
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
});

describe('MultiplayerProvider player identity', () => {
  it('uses a per-tab player token instead of a shared localStorage token', async () => {
    localStorage.setItem('huskyhac.playerToken', 'old-shared-local-token');

    await renderProvider();
    await clickJoin();

    expect(mocks.joinPayloads).toHaveLength(1);
    expect(mocks.joinPayloads[0].profile.playerToken).not.toBe('old-shared-local-token');
    expect(sessionStorage.getItem('huskyhac.playerToken')).toBe(mocks.joinPayloads[0].profile.playerToken);
  });
});

async function renderProvider() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MultiplayerProvider>
        <JoinButton />
      </MultiplayerProvider>,
    );
  });
}

function JoinButton() {
  const multiplayer = useMultiplayer();

  return (
    <button type="button" data-testid="join-room" onClick={() => void multiplayer.joinRoom('FRANCE')}>
      Join
    </button>
  );
}

async function clickJoin() {
  const button = container?.querySelector<HTMLButtonElement>('[data-testid="join-room"]');
  expect(button).not.toBeNull();

  await act(async () => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function makeStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  };
}
