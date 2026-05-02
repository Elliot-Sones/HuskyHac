/** @vitest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { TranscriptLine as ScenarioTranscriptLine } from '@/shared/contracts';
import { TranscriptLine } from '@/ui/TranscriptLine';

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
});

describe('TranscriptLine', () => {
  it('labels NPC lines with the active scenario NPC name', async () => {
    await renderTranscriptLine({
      line: {
        id: 'npc-opening',
        speaker: 'npc',
        text: 'Bienvenido.',
        translation: 'Welcome.',
      },
      npcName: 'Agente Sofia',
    });

    expect(container?.textContent).toContain('Agente Sofia');
    expect(container?.textContent).not.toContain('Mme. Laurent');
  });
});

async function renderTranscriptLine({
  line,
  npcName,
}: {
  line: ScenarioTranscriptLine;
  npcName?: string;
}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root?.render(<TranscriptLine line={line} npcName={npcName} />);
  });
}
