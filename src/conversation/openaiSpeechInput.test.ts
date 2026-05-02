import { describe, expect, it, vi } from 'vitest';
import { createOpenAiSpeechInput } from '@/conversation/openaiSpeechInput';

describe('createOpenAiSpeechInput', () => {
  it('records microphone audio and sends it to the OpenAI transcription endpoint', async () => {
    const recorders: FakeRecorder[] = [];
    const fetcher = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const form = init?.body as FormData;
      const file = form.get('file');

      expect(form.get('model')).toBe('gpt-4o-mini-transcribe');
      expect(form.get('language')).toBe('fr');
      expect(file).toBeInstanceOf(Blob);

      return new Response(JSON.stringify({ text: 'Bonjour, je cherche le RER.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const input = createOpenAiSpeechInput({
      endpoint: '/api/openai/transcribe',
      fetcher,
      mediaAccess: {
        mediaDevices: {
          getUserMedia: vi.fn(async () => fakeStream()),
        },
      },
      recorderFactory: () => {
        const recorder = new FakeRecorder();
        recorders.push(recorder);
        return recorder;
      },
      maxDurationMs: 1000,
    });

    const transcriptPromise = input.listen({ lang: 'fr-FR' });
    await Promise.resolve();
    const recorder = recorders[0];
    if (!recorder) throw new Error('Recorder was not created.');
    recorder.emitAudioAndStop();
    const transcript = await transcriptPromise;

    expect(fetcher).toHaveBeenCalledWith('/api/openai/transcribe', expect.any(Object));
    expect(transcript).toMatchObject({
      text: 'Bonjour, je cherche le RER.',
      source: 'speech',
    });
  });
});

class FakeRecorder {
  mimeType = 'audio/webm';
  state: RecordingState = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: ((event: { error?: Error }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.onstop?.();
  }

  emitAudioAndStop() {
    this.ondataavailable?.({ data: new Blob(['audio-bytes'], { type: 'audio/webm' }) });
    this.stop();
  }
}

function fakeStream() {
  return {
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream;
}
