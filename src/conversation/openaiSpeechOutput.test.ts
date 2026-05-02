import { describe, expect, it, vi } from 'vitest';
import { createOpenAiSpeechOutput } from '@/conversation/openaiSpeechOutput';
import type { TranscriptLine } from '@/shared/contracts';

describe('createOpenAiSpeechOutput', () => {
  it('requests OpenAI speech audio for the NPC line and plays the returned blob', async () => {
    const play = vi.fn(async () => undefined);
    const fetcher = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));

      expect(body.text).toBe('Bonjour, suivez les panneaux vers la gare.');
      expect(body.lang).toBe('fr-FR');

      return new Response(new Blob(['mp3-bytes'], { type: 'audio/mpeg' }), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      });
    });
    const line: TranscriptLine = {
      id: 'npc-1',
      speaker: 'npc',
      text: 'Bonjour, suivez les panneaux vers la gare.',
    };

    const output = createOpenAiSpeechOutput({
      endpoint: '/api/openai/tts',
      fetcher,
      audioFactory: () => ({ play, pause: vi.fn(), currentTime: 0 }),
      objectUrl: {
        createObjectURL: () => 'blob:audio',
        revokeObjectURL: vi.fn(),
      },
    });

    await output.speak(line, { lang: 'fr-FR' });

    expect(fetcher).toHaveBeenCalledWith('/api/openai/tts', expect.any(Object));
    expect(play).toHaveBeenCalledTimes(1);
  });
});
