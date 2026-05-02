/** @vitest-environment jsdom */
import type { ComponentProps } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RoomState } from '@/shared/contracts';
import { RemoteSnapshotStore } from '@/multiplayer/remoteSnapshotStore';
import { WorldCanvas } from '@/world/WorldCanvas';
import { airportWorldLayout } from '@/world/airportLayout';

const mocks = vi.hoisted(() => ({
  playerController: vi.fn(() => <div data-testid="player-controller" />),
  remotePlayers: vi.fn(() => <div data-testid="remote-players" />),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
}));

vi.mock('@react-three/drei', () => ({
  Environment: () => null,
  KeyboardControls: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="keyboard-controls">{children}</div>
  ),
  Loader: () => <div data-testid="loader" />,
  PerspectiveCamera: () => null,
}));

vi.mock('@/world/PlayerController', () => ({
  PlayerController: mocks.playerController,
}));

vi.mock('@/world/RemotePlayer', () => ({
  RemotePlayers: mocks.remotePlayers,
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
  vi.clearAllMocks();
});

describe('WorldCanvas multiplayer integration', () => {
  it('renders remote players and gives the local controller snapshot publishing props', async () => {
    const remoteSnapshots = new RemoteSnapshotStore();
    const room = makeRoomState();
    const publishSnapshot = vi.fn();

    await renderWorldCanvas({
      multiplayerRoom: room,
      multiplayerSelfId: 'self-player',
      remoteSnapshots,
      onPublishSnapshot: publishSnapshot,
    });

    expect(mocks.remotePlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        profiles: room.players,
        selfId: 'self-player',
        snapshots: remoteSnapshots,
      }),
      expect.anything(),
    );
    expect(mocks.playerController).toHaveBeenCalledWith(
      expect.objectContaining({
        multiplayerSelfId: 'self-player',
        onPublishSnapshot: publishSnapshot,
      }),
      expect.anything(),
    );
  });
});

async function renderWorldCanvas(overrides: Partial<ComponentProps<typeof WorldCanvas>> = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  const Scene = vi.fn(() => <div data-testid="scene" />);
  const props: ComponentProps<typeof WorldCanvas> = {
    mode: 'world',
    layout: airportWorldLayout,
    Scene,
    isNearNpc: false,
    conversationStatus: 'idle',
    onNearNpcChange: vi.fn(),
    onNearTransitChange: vi.fn(),
    onInteract: vi.fn(),
    onTransitInteract: vi.fn(),
    playerProfile: {
      displayName: 'Ava',
      color: '#2563eb',
      accessory: 'backpack',
    },
    ...overrides,
  };

  await act(async () => {
    root?.render(<WorldCanvas {...props} />);
  });
}

function makeRoomState(): RoomState {
  return {
    id: 'room-1',
    code: 'ROOM12',
    createdAt: 1,
    maxPlayers: 4,
    players: [
      {
        id: 'self-player',
        roomId: 'room-1',
        displayName: 'Ava',
        color: '#2563eb',
        accessory: 'backpack',
        connected: true,
      },
      {
        id: 'remote-player',
        roomId: 'room-1',
        displayName: 'Noah',
        color: '#16a34a',
        accessory: 'suitcase',
        connected: true,
      },
    ],
    snapshots: {},
  };
}
