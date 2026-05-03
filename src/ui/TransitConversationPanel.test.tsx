/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { TransitConversationPanel } from '@/ui/TransitConversationPanel';
import { TRANSIT_DIALOGUES } from '@/world/transitDialogues';

const mocks = vi.hoisted(() => ({
  speechInput: {
    isSupported: vi.fn(() => true),
    listen: vi.fn(async () => ({
      text: 'Je voudrais aller au cafe Bisset.',
      confidence: 0.98,
      source: 'speech' as const,
    })),
    stop: vi.fn(),
  },
  useLessonStore: vi.fn(),
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('@/state/lessonStore', () => ({
  useLessonStore: mocks.useLessonStore,
}));

vi.mock('@/conversation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/conversation')>()),
  createDefaultSpeechInput: () => mocks.speechInput,
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

describe('TransitConversationPanel', () => {
  it('plays the transit opening line again after the panel closes and reopens', async () => {
    const autoPlayNpcLine = vi.fn(async () => {});
    mocks.useLessonStore.mockReturnValue({
      autoPlayNpcLine,
      scenario: airportFranceScenario,
      speechOutputSupported: true,
    });

    await renderTransitConversationPanel();
    act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;

    await renderTransitConversationPanel();

    expect(autoPlayNpcLine).toHaveBeenCalledTimes(2);
    expect(autoPlayNpcLine).toHaveBeenCalledWith(TRANSIT_DIALOGUES.taxi.opening, {
      immediate: true,
    });
  });

  it('shows the café travel action after the player practices any phrase', async () => {
    const onTravelDestination = vi.fn();
    mocks.useLessonStore.mockReturnValue({
      autoPlayNpcLine: vi.fn(async () => {}),
      scenario: airportFranceScenario,
      speechOutputSupported: true,
    });

    await renderTransitConversationPanel({ onTravelDestination });
    await clickByAriaLabel('Practice phrase');

    const travelButton = getButtonByText('Continue to Café Bisset');
    expect(travelButton).not.toBeNull();

    await clickButton(travelButton);

    expect(onTravelDestination).toHaveBeenCalledWith('france-coffee_shop');
  });

  it('shows the café travel action when the user clicks any text option', async () => {
    mocks.useLessonStore.mockReturnValue(createLessonStoreMock());

    await renderTransitConversationPanel();
    await clickButton(getButtonByText('Café Bisset'));

    expect(getButtonByText('Continue to Café Bisset')).not.toBeNull();
  });

  it('shows the café travel action when the user answers by voice', async () => {
    mocks.useLessonStore.mockReturnValue(createLessonStoreMock());

    await renderTransitConversationPanel();
    await clickByAriaLabel('Answer by voice');

    expect(mocks.speechInput.listen).toHaveBeenCalledWith({
      lang: 'fr-FR',
      languageName: 'French',
      transcriptionLanguage: 'fr',
    });
    expect(getButtonByText('Continue to Café Bisset')).not.toBeNull();
  });

  it('shows the Eiffel Tower travel action when the user clicks an Eiffel text option', async () => {
    const onTravelDestination = vi.fn();
    mocks.useLessonStore.mockReturnValue(createLessonStoreMock());

    await renderTransitConversationPanel({ onTravelDestination });
    await clickButton(getButtonByText('Tour Eiffel'));

    const travelButton = getButtonByText('Go to the Eiffel Tower');
    expect(travelButton).not.toBeNull();

    await clickButton(travelButton);

    expect(onTravelDestination).toHaveBeenCalledWith('france-eiffel_tour');
  });

  it('shows the Eiffel Tower travel action when the spoken answer asks for Eiffel', async () => {
    mocks.speechInput.listen.mockResolvedValueOnce({
      text: 'Je voudrais aller a la Tour Eiffel.',
      confidence: 0.98,
      source: 'speech' as const,
    });
    mocks.useLessonStore.mockReturnValue(createLessonStoreMock());

    await renderTransitConversationPanel();
    await clickByAriaLabel('Answer by voice');

    expect(getButtonByText('Go to the Eiffel Tower')).not.toBeNull();
  });
});

function createLessonStoreMock() {
  return {
    autoPlayNpcLine: vi.fn(async () => {}),
    scenario: airportFranceScenario,
    speechInputSupported: true,
    speechOutputSupported: true,
  };
}

async function renderTransitConversationPanel({
  onTravelDestination = vi.fn(),
}: {
  onTravelDestination?: (destinationId: string) => void;
} = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <TransitConversationPanel
        dialogue={TRANSIT_DIALOGUES.taxi}
        onClose={vi.fn()}
        onTravelDestination={onTravelDestination}
      />,
    );
  });
}

async function clickByAriaLabel(label: string) {
  const button = container?.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`);
  expect(button).not.toBeNull();
  await clickButton(button);
}

async function clickButton(button: HTMLButtonElement | null | undefined) {
  await act(async () => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function getButtonByText(text: string) {
  return [...(container?.querySelectorAll<HTMLButtonElement>('button') ?? [])].find((button) =>
    button.textContent?.includes(text),
  ) ?? null;
}
