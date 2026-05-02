/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { ConversationPanel } from '@/ui/ConversationPanel';
import type { LessonStore } from '@/state/lessonStore';

const mocks = vi.hoisted(() => ({
  useLessonStore: vi.fn(),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('@/state/lessonStore', () => ({
  useLessonStore: mocks.useLessonStore,
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

describe('ConversationPanel', () => {
  it('automatically plays the opening NPC line when the panel opens', async () => {
    const autoPlayLastNpcLine = vi.fn(async () => {});
    mocks.useLessonStore.mockReturnValue(makeLessonStore({ autoPlayLastNpcLine }));

    await renderConversationPanel();

    expect(autoPlayLastNpcLine).toHaveBeenCalledWith({ immediate: true });
    expect(autoPlayLastNpcLine).toHaveBeenCalledTimes(1);
  });
});

async function renderConversationPanel() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(<ConversationPanel />);
  });
}

function makeLessonStore(overrides: Partial<LessonStore> = {}): LessonStore {
  const currentTurn = airportFranceScenario.turns[0];

  const store: LessonStore = {
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
    autoPlayLastNpcLine: vi.fn(),
    toggleListening: vi.fn(),
    setStatus: vi.fn(),
    reset: vi.fn(),
  };

  return Object.assign(store, overrides);
}
