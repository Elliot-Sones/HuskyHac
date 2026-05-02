/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LocalPlayerProfile } from '@/play/playerProfile';
import type { LessonStore } from '@/state/lessonStore';
import { FRANCE_MULTIPLAYER_ROOM_CODE } from '@/shared/contracts';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { PlayWorld } from '@/play/PlayWorld';
import { RemoteSnapshotStore } from '@/multiplayer/remoteSnapshotStore';

const mocks = vi.hoisted(() => ({
  joinRoom: vi.fn(async () => {}),
  publishSnapshot: vi.fn(),
  worldCanvas: vi.fn(() => <div data-testid="world-canvas" />),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('@/play/PlayerEntryMock', () => ({
  PlayerEntryMock: ({ onLaunch }: { onLaunch: (profile: LocalPlayerProfile) => void }) => (
    <button
      type="button"
      data-testid="launch-player"
      onClick={() =>
        onLaunch({
          displayName: 'Ava',
          color: '#2563eb',
          accessory: 'backpack',
        })
      }
    >
      Launch
    </button>
  ),
}));

vi.mock('@/play/playerProfile', () => ({
  readLocalPlayerProfile: () => ({
    displayName: 'Ava',
    color: '#2563eb',
    accessory: 'backpack',
  }),
}));

vi.mock('@/play/ArrivalTransition', () => ({
  ArrivalTransition: ({ onComplete }: { onComplete: () => void }) => (
    <button type="button" data-testid="complete-arrival" onClick={onComplete}>
      Arrive
    </button>
  ),
}));

vi.mock('@/state/lessonStore', () => ({
  LessonProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLessonStore: () => makeLessonStore(),
}));

vi.mock('@/world/WorldCanvas', () => ({
  WorldCanvas: mocks.worldCanvas,
}));

vi.mock('@/multiplayer/MultiplayerProvider', () => ({
  MultiplayerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useMultiplayer: () => ({
    status: 'solo',
    disabled: false,
    room: null,
    self: null,
    profileDraft: {
      displayName: 'Ava',
      color: '#2563eb',
      accessory: 'backpack',
    },
    error: null,
    remoteSnapshots: new RemoteSnapshotStore(),
    setProfileDraft: vi.fn(),
    createRoom: vi.fn(),
    joinRoom: mocks.joinRoom,
    leaveRoom: vi.fn(),
    publishSnapshot: mocks.publishSnapshot,
  }),
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

describe('PlayWorld multiplayer integration', () => {
  it('joins the shared France room without rendering a room-code lobby', async () => {
    await renderPlayWorld();

    await click('launch-player');
    await click('complete-arrival');

    expect(mocks.worldCanvas).toHaveBeenCalled();
    expect(mocks.joinRoom).toHaveBeenCalledWith(FRANCE_MULTIPLAYER_ROOM_CODE);
    expect(container?.textContent).not.toContain('Airport room');
    expect(container?.textContent).not.toContain('Create room');
  });
});

async function renderPlayWorld() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={['/play']}>
        <PlayWorld />
      </MemoryRouter>,
    );
  });
}

async function click(testId: string) {
  const button = container?.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
  expect(button).not.toBeNull();

  await act(async () => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function makeLessonStore(): LessonStore {
  const currentTurn = airportFranceScenario.turns[0];

  return {
    scenario: airportFranceScenario,
    turnIndex: 0,
    transcript: [currentTurn.npcLine],
    status: 'idle',
    selectedResponseId: null,
    lastMatchScore: null,
    goalProgress: airportFranceScenario.progress,
    dynamicResponses: null,
    feedback: null,
    errorMessage: null,
    speechInputSupported: true,
    speechOutputSupported: true,
    lastNpcLine: currentTurn.npcLine,
    currentTurn,
    currentResponses: currentTurn.responses,
    selectResponse: vi.fn(),
    submitFreeform: vi.fn(),
    recordSpeech: vi.fn(),
    replayLastNpcLine: vi.fn(),
    autoPlayNpcLine: vi.fn(),
    autoPlayLastNpcLine: vi.fn(),
    toggleListening: vi.fn(),
    setStatus: vi.fn(),
    reset: vi.fn(),
  };
}
