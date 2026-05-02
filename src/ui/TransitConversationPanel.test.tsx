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
});

async function renderTransitConversationPanel() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(
      <TransitConversationPanel
        dialogue={TRANSIT_DIALOGUES.taxi}
        onClose={vi.fn()}
      />,
    );
  });
}
