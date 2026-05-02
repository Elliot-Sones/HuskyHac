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
import { resolvePlayDestination } from '@/play/destinations';
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
  it('auto-plays the current NPC line every time it is requested', async () => {
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

    expect(speechOutput.speak).toHaveBeenCalledTimes(2);
    expect(speechOutput.speak).toHaveBeenCalledWith(airportFranceScenario.turns[0].npcLine, {
      lang: 'fr-FR',
      languageName: 'French',
      transcriptionLanguage: 'fr',
      preferBrowser: true,
    });
  });

  it('auto-plays an arbitrary transit NPC line every time it is requested', async () => {
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

    expect(speechOutput.speak).toHaveBeenCalledTimes(2);
    expect(speechOutput.speak).toHaveBeenCalledWith(transitLine, {
      lang: 'fr-FR',
      languageName: 'French',
      transcriptionLanguage: 'fr',
      preferBrowser: true,
    });
  });

  it('uses a clicked scripted response to advance immediately without asking the NPC brain', async () => {
    let store: LessonStore | null = null;
    const brain = makeNpcBrain();
    const speechOutput = makeSpeechOutput();
    const response = airportFranceScenario.turns[0].responses[1];

    await renderLessonProvider({
      services: {
        brain,
        speechInput: makeSpeechInput(),
        speechOutput,
      },
      onStore(nextStore) {
        store = nextStore;
      },
    });

    await act(async () => {
      await getStore(store).submitResponseOption(response);
    });

    const updatedStore = getStore(store);

    expect(brain.generateReply).not.toHaveBeenCalled();
    expect(updatedStore.lastNpcLine?.id).toBe(airportFranceScenario.turns[1].npcLine.id);
    expect(updatedStore.turnIndex).toBe(1);
    expect(updatedStore.transcript.at(-2)).toMatchObject({
      speaker: 'player',
      text: response.french,
      source: 'suggestion',
    });
    expect(speechOutput.speak).toHaveBeenCalledWith(airportFranceScenario.turns[1].npcLine, {
      lang: 'fr-FR',
      languageName: 'French',
      transcriptionLanguage: 'fr',
      preferBrowser: true,
    });
  });

  it('records and speaks with the selected country language', async () => {
    let store: LessonStore | null = null;
    const spanishScenario = resolvePlayDestination('airport-spain').scenario;
    const speechInput = makeSpeechInput({
      isSupported: vi.fn(() => true),
      listen: vi.fn(async (): Promise<SpeechTranscript> => ({
        text: 'Quiero ir al centro.',
        source: 'speech',
      })),
    });
    const speechOutput = makeSpeechOutput();

    await renderLessonProvider({
      scenario: spanishScenario,
      services: {
        brain: makeNpcBrain({
          npcReply: {
            text: 'Claro. Siga los carteles.',
            translation: 'Of course. Follow the signs.',
          },
        }),
        speechInput,
        speechOutput,
      },
      onStore(nextStore) {
        store = nextStore;
      },
    });

    await act(async () => {
      await getStore(store).recordSpeech();
    });

    expect(speechInput.listen).toHaveBeenCalledWith({
      lang: 'es-ES',
      languageName: 'Spanish',
      transcriptionLanguage: 'es',
    });
    expect(speechOutput.speak).toHaveBeenLastCalledWith(expect.any(Object), {
      lang: 'es-ES',
      languageName: 'Spanish',
      transcriptionLanguage: 'es',
      preferBrowser: true,
    });
  });
});

async function renderLessonProvider({
  scenario = airportFranceScenario,
  services,
  onStore,
}: {
  scenario?: Parameters<typeof LessonProvider>[0]['scenario'];
  services: Parameters<typeof LessonProvider>[0]['services'];
  onStore: (store: LessonStore) => void;
}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <LessonProvider scenario={scenario} services={services}>
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

function makeNpcBrain(
  overrides: Partial<Awaited<ReturnType<NpcBrain['generateReply']>>> = {},
): NpcBrain {
  return {
    generateReply: vi.fn(async () => ({
      npcReply: { text: 'Bonjour.', translation: 'Hello.' },
      feedback: {},
      suggestedResponses: [],
      scene: { complete: false, reason: 'continue', score: 0 },
      memoryFacts: [],
      ...overrides,
    })),
  };
}

function getStore(store: LessonStore | null): LessonStore {
  if (!store) {
    throw new Error('Lesson store was not mounted.');
  }

  return store;
}

function makeSpeechInput(overrides: Partial<SpeechInput> = {}): SpeechInput {
  return {
    isSupported: vi.fn(() => false),
    listen: vi.fn(async (): Promise<SpeechTranscript> => ({ text: '', source: 'speech' })),
    stop: vi.fn(),
    ...overrides,
  };
}

function makeSpeechOutput(): SpeechOutput {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn(async () => {}),
    cancel: vi.fn(),
  };
}
