/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TransitConversationPanel } from '@/ui/TransitConversationPanel';
import { TRANSIT_DIALOGUES } from '@/world/transitDialogues';

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

describe('TransitConversationPanel', () => {
  it('plays the transit opening line again after the panel closes and reopens', async () => {
    const autoPlayNpcLine = vi.fn(async () => {});
    mocks.useLessonStore.mockReturnValue({
      autoPlayNpcLine,
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

  it('shows an Eiffel Tower travel action after practicing an Eiffel Tower request', async () => {
    const onTravelDestination = vi.fn();
    mocks.useLessonStore.mockReturnValue({
      autoPlayNpcLine: vi.fn(async () => {}),
      speechOutputSupported: true,
    });

    await renderTransitConversationPanel({ onTravelDestination });
    await clickByAriaLabel('Practice phrase');

    const travelButton = getButtonByText('Go to the Eiffel Tower');
    expect(travelButton).not.toBeNull();

    await clickButton(travelButton);

    expect(onTravelDestination).toHaveBeenCalledWith('france-eiffel_tour');
  });
});

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
