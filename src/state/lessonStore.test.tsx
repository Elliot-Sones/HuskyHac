/** @vitest-environment jsdom */
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  NpcBrain,
  SpeechInput,
  SpeechOutput,
  SpeechTranscript,
} from '@/conversation/conversationTypes';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { LessonProvider, type LessonStore, useLessonStore } from '@/state/lessonStore';
import { TRANSIT_DIALOGUES } from '@/world/transitDialogues';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

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

describe('LessonProvider', () => {
  it('auto-plays the current NPC line once with immediate browser-preferred speech', async () => {
    let store: LessonStore | null = null;
    const speechOutput = makeSpeechOutput();

    await renderLessonProvider({
      services: {
        brain: makeNpcBrain(),
        speechInput: makeSpeechInput(),
        speechOutput,
      },
      onStore(nextStore) {
        store = nextStore;
      },
    });

    await act(async () => {
      await store?.autoPlayLastNpcLine({ immediate: true });
      await store?.autoPlayLastNpcLine({ immediate: true });
    });

    expect(speechOutput.speak).toHaveBeenCalledTimes(1);
    expect(speechOutput.speak).toHaveBeenCalledWith(airportFranceScenario.turns[0].npcLine, {
      lang: 'fr-FR',
      preferBrowser: true,
    });
  });

  it('auto-plays an arbitrary transit NPC line once with immediate browser-preferred speech', async () => {
    let store: LessonStore | null = null;
    const speechOutput = makeSpeechOutput();
    const transitLine = TRANSIT_DIALOGUES.taxi.opening;

    await renderLessonProvider({
      services: {
        brain: makeNpcBrain(),
        speechInput: makeSpeechInput(),
        speechOutput,
      },
      onStore(nextStore) {
        store = nextStore;
      },
    });

    await act(async () => {
      await store?.autoPlayNpcLine(transitLine, { immediate: true });
      await store?.autoPlayNpcLine(transitLine, { immediate: true });
    });

    expect(speechOutput.speak).toHaveBeenCalledTimes(1);
    expect(speechOutput.speak).toHaveBeenCalledWith(transitLine, {
      lang: 'fr-FR',
      preferBrowser: true,
    });
  });
});

async function renderLessonProvider({
  services,
  onStore,
}: {
  services: Parameters<typeof LessonProvider>[0]['services'];
  onStore: (store: LessonStore) => void;
}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <LessonProvider scenario={airportFranceScenario} services={services}>
        <StoreProbe onStore={onStore} />
      </LessonProvider>,
    );
  });
}

function StoreProbe({ onStore }: { onStore: (store: LessonStore) => void }) {
  const store = useLessonStore();

  useEffect(() => {
    onStore(store);
  }, [onStore, store]);

  return null;
}

function makeNpcBrain(): NpcBrain {
  return {
    generateReply: vi.fn(async () => ({
      npcReply: { text: 'Bonjour.', translation: 'Hello.' },
      feedback: {},
      suggestedResponses: [],
      scene: { complete: false, reason: 'continue', score: 0 },
      memoryFacts: [],
    })),
  };
}

function makeSpeechInput(): SpeechInput {
  return {
    isSupported: vi.fn(() => false),
    listen: vi.fn(async (): Promise<SpeechTranscript> => ({ text: '', source: 'speech' })),
    stop: vi.fn(),
  };
}

function makeSpeechOutput(): SpeechOutput {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn(async () => {}),
    cancel: vi.fn(),
  };
}
