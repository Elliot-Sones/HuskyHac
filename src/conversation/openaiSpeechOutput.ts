import type { TranscriptLine } from '@/shared/contracts';
import type { SpeechOutput } from '@/conversation/conversationTypes';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface PlayableAudio {
  currentTime: number;
  pause(): void;
  play(): Promise<void>;
}

interface ObjectUrlApi {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

interface CreateOpenAiSpeechOutputOptions {
  endpoint?: string;
  fetcher?: FetchLike;
  audioFactory?: (sourceUrl: string) => PlayableAudio;
  objectUrl?: ObjectUrlApi;
}

export function createOpenAiSpeechOutput({
  endpoint = '/api/openai/tts',
  fetcher = globalThis.fetch.bind(globalThis),
  audioFactory = (sourceUrl) => new Audio(sourceUrl),
  objectUrl = globalThis.URL,
}: CreateOpenAiSpeechOutputOptions = {}): SpeechOutput {
  let currentAudio: PlayableAudio | null = null;
  let currentObjectUrl: string | null = null;

  function cancel() {
    currentAudio?.pause();
    if (currentAudio) {
      currentAudio.currentTime = 0;
    }
    if (currentObjectUrl) {
      objectUrl.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    currentAudio = null;
  }

  return {
    isSupported: () => {
      const fetcherCandidate: unknown = fetcher;
      const audioFactoryCandidate: unknown = audioFactory;
      const objectUrlCandidate = objectUrl as Partial<ObjectUrlApi> | undefined;

      return (
        typeof fetcherCandidate === 'function' &&
        typeof audioFactoryCandidate === 'function' &&
        typeof objectUrlCandidate?.createObjectURL === 'function' &&
        typeof objectUrlCandidate?.revokeObjectURL === 'function'
      );
    },
    cancel,
    async speak(line: TranscriptLine, options = {}) {
      cancel();

      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: line.text,
          lang: options.lang ?? 'fr-FR',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI speech request failed with ${response.status}`);
      }

      currentObjectUrl = objectUrl.createObjectURL(await response.blob());
      currentAudio = audioFactory(currentObjectUrl);
      await currentAudio.play();
    },
  };
}
