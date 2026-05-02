import { describe, expect, it, vi } from 'vitest';
import { createBrowserSpeechOutput } from '@/conversation/speechOutput';
import type { TranscriptLine } from '@/shared/contracts';

describe('createBrowserSpeechOutput', () => {
  it('speaks NPC replies with a French voice when one is available', async () => {
    const spoken: SpeechSynthesisUtterance[] = [];
    const frenchVoice = { lang: 'fr-FR', name: 'Claire' } as SpeechSynthesisVoice;
    const synth = {
      getVoices: () =>
        [
          { lang: 'en-US', name: 'Alex' } as SpeechSynthesisVoice,
          frenchVoice,
        ] satisfies SpeechSynthesisVoice[],
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        spoken.push(utterance);
        utterance.onend?.({} as SpeechSynthesisEvent);
      }),
      cancel: vi.fn(),
    } as unknown as SpeechSynthesis;
    const utteranceFactory = (text: string) =>
      ({
        text,
        lang: '',
        voice: null,
        rate: 1,
        pitch: 1,
        onend: null,
        onerror: null,
      }) as unknown as SpeechSynthesisUtterance;
    const line: TranscriptLine = {
      id: 'npc-1',
      speaker: 'npc',
      text: 'Bonjour, suivez les panneaux vers la gare.',
    };

    const output = createBrowserSpeechOutput({ synth, utteranceFactory });

    await output.speak(line, { lang: 'fr-FR' });

    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect(spoken[0]?.text).toBe(line.text);
    expect(spoken[0]?.lang).toBe('fr-FR');
    expect(spoken[0]?.voice).toBe(frenchVoice);
  });
});
