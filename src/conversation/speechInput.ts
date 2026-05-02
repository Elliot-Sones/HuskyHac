import type { SpeechInput, SpeechTranscript } from '@/conversation/conversationTypes';

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>>;
}

export function createBrowserSpeechInput(win: Window | undefined = getWindow()): SpeechInput {
  let activeRecognition: SpeechRecognitionLike | null = null;

  return {
    isSupported: () => Boolean(resolveRecognition(win)),
    stop: () => {
      activeRecognition?.stop();
      activeRecognition = null;
    },
    listen(options = {}) {
      const Recognition = resolveRecognition(win);

      if (!Recognition) {
        return Promise.reject(new Error('Browser speech recognition is unavailable.'));
      }

      return new Promise<SpeechTranscript>((resolve, reject) => {
        const recognition = new Recognition();
        activeRecognition = recognition;
        recognition.lang = options.lang ?? 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          const result = event.results[0]?.[0];
          const text = result?.transcript?.trim();

          if (!text) {
            reject(new Error('No speech transcript was captured.'));
            return;
          }

          resolve({ text, confidence: result.confidence, source: 'speech' });
        };
        recognition.onerror = (event) =>
          reject(new Error(event.error || 'Speech recognition failed.'));
        recognition.onend = () => {
          activeRecognition = null;
        };
        recognition.start();
      });
    },
  };
}

function resolveRecognition(win: Window | undefined): SpeechRecognitionConstructor | undefined {
  if (!win) {
    return undefined;
  }

  const candidate = win as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}

function getWindow() {
  return typeof window === 'undefined' ? undefined : window;
}
