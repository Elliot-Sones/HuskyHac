/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { resolvePlayDestination } from '@/play/destinations';
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

  it('plays the opening NPC line again after the panel closes and reopens', async () => {
    const autoPlayLastNpcLine = vi.fn(async () => {});
    mocks.useLessonStore.mockReturnValue(makeLessonStore({ autoPlayLastNpcLine }));

    await renderConversationPanel();
    act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;

    await renderConversationPanel();

    expect(autoPlayLastNpcLine).toHaveBeenCalledTimes(2);
  });

  it('submits clicked suggestion buttons through the fast scripted response path', async () => {
    const submitResponseOption = vi.fn(async () => {});
    mocks.useLessonStore.mockReturnValue(makeLessonStore({ submitResponseOption }));

    await renderConversationPanel();
    await clickButton(getButtonByText('Bonjour, comment puis-je aller au centre-ville ?'));

    expect(submitResponseOption).toHaveBeenCalledWith(airportFranceScenario.turns[0].responses[1]);
  });

  it('labels recording controls with the selected country language', async () => {
    const spanishScenario = resolvePlayDestination('airport-spain').scenario;
    mocks.useLessonStore.mockReturnValue(
      makeLessonStore({
        scenario: spanishScenario,
        currentTurn: spanishScenario.turns[0],
        currentResponses: spanishScenario.turns[0].responses,
        lastNpcLine: spanishScenario.turns[0].npcLine,
      }),
    );

    await renderConversationPanel();

    expect(getButtonByLabel('Record Spanish answer')).not.toBeNull();
    expect(container?.textContent).toContain('Custom Spanish response');
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
    submitResponseOption: vi.fn(async () => {}),
    submitFreeform: vi.fn(),
    recordSpeech: vi.fn(),
    replayLastNpcLine: vi.fn(),
    autoPlayNpcLine: vi.fn(),
    autoPlayLastNpcLine: vi.fn(),
    toggleListening: vi.fn(),
    setStatus: vi.fn(),
    reset: vi.fn(),
  };

  return Object.assign(store, overrides) as LessonStore;
}

async function clickButton(button: HTMLButtonElement | null | undefined) {
  expect(button).not.toBeNull();
  await act(async () => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function getButtonByText(text: string) {
  return [...(container?.querySelectorAll<HTMLButtonElement>('button') ?? [])].find((button) =>
    button.textContent?.includes(text),
  ) ?? null;
}

function getButtonByLabel(label: string) {
  return [...(container?.querySelectorAll<HTMLButtonElement>('button') ?? [])].find(
    (button) => button.getAttribute('aria-label') === label,
  ) ?? null;
}
