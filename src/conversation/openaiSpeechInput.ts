import type { SpeechInput, SpeechTranscript } from '@/conversation/conversationTypes';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface RecorderLike {
  mimeType: string;
  state: RecordingState;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onerror: ((event: { error?: Error }) => void) | null;
  onstop: (() => void) | null;
  start(): void;
  stop(): void;
}

interface MediaAccessLike {
  mediaDevices?: {
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  };
}

interface CreateOpenAiSpeechInputOptions {
  endpoint?: string;
  fetcher?: FetchLike;
  mediaAccess?: MediaAccessLike;
  recorderFactory?: (stream: MediaStream, options: MediaRecorderOptions) => RecorderLike;
  maxDurationMs?: number;
}

const DEFAULT_MODEL = 'gpt-4o-mini-transcribe';
const DEFAULT_MIME_TYPE = 'audio/webm';

export function createOpenAiSpeechInput({
  endpoint = '/api/openai/transcribe',
  fetcher = globalThis.fetch.bind(globalThis),
  mediaAccess = getNavigator(),
  recorderFactory = createRecorder,
  maxDurationMs = 15000,
}: CreateOpenAiSpeechInputOptions = {}): SpeechInput {
  let activeRecorder: RecorderLike | null = null;
  let activeStream: MediaStream | null = null;

  function stopStream() {
    activeStream?.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }

  return {
    isSupported: () =>
      Boolean(
        mediaAccess?.mediaDevices?.getUserMedia &&
          typeof fetcher === 'function' &&
          typeof recorderFactory === 'function' &&
          typeof FormData !== 'undefined' &&
          typeof Blob !== 'undefined',
      ),
    stop: () => {
      if (activeRecorder?.state === 'recording') {
        activeRecorder.stop();
      }
      activeRecorder = null;
      stopStream();
    },
    async listen(options = {}) {
      if (!mediaAccess?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone recording is unavailable in this browser.');
      }

      const stream = await mediaAccess.mediaDevices.getUserMedia({ audio: true });
      activeStream = stream;
      const chunks: Blob[] = [];
      const mimeType = resolveMimeType();
      const recorder = recorderFactory(stream, mimeType ? { mimeType } : {});
      activeRecorder = recorder;

      return new Promise<SpeechTranscript>((resolve, reject) => {
        let settled = false;
        const maxTimer = globalThis.setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, maxDurationMs);

        function settle(callback: () => void) {
          if (settled) return;
          settled = true;
          globalThis.clearTimeout(maxTimer);
          activeRecorder = null;
          stopStream();
          callback();
        }

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        recorder.onerror = (event) => {
          settle(() => reject(event.error ?? new Error('Recording failed.')));
        };
        recorder.onstop = () => {
          settle(async () => {
            try {
              const blob = new Blob(chunks, { type: recorder.mimeType || DEFAULT_MIME_TYPE });

              if (blob.size === 0) {
                reject(new Error('No microphone audio was captured.'));
                return;
              }

              const response = await fetcher(endpoint, {
                method: 'POST',
                body: buildTranscriptionForm(blob, options.lang ?? 'fr-FR'),
              });

              if (!response.ok) {
                throw new Error(`OpenAI transcription request failed with ${response.status}`);
              }

              const payload = await response.json();
              const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

              if (!text) {
                throw new Error('No speech transcript was returned.');
              }

              resolve({ text, source: 'speech' });
            } catch (error) {
              reject(error);
            }
          });
        };
        recorder.start();
      });
    },
  };
}

function buildTranscriptionForm(blob: Blob, lang: string) {
  const form = new FormData();
  form.append('file', blob, `learner-answer.${fileExtensionFor(blob.type)}`);
  form.append('model', DEFAULT_MODEL);
  form.append('response_format', 'json');
  form.append('language', normalizeLanguage(lang));
  form.append(
    'prompt',
    'The learner is speaking simple French in an airport roleplay. Preserve the French words they say.',
  );
  return form;
}

function normalizeLanguage(lang: string) {
  return lang.split('-')[0]?.toLowerCase() || 'fr';
}

function fileExtensionFor(mimeType: string) {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
}

function resolveMimeType() {
  const recorder = getMediaRecorder();

  if (recorder?.isTypeSupported?.(DEFAULT_MIME_TYPE)) {
    return DEFAULT_MIME_TYPE;
  }

  if (recorder?.isTypeSupported?.('audio/mp4')) {
    return 'audio/mp4';
  }

  return '';
}

function createRecorder(stream: MediaStream, options: MediaRecorderOptions): RecorderLike {
  return new MediaRecorder(stream, options) as unknown as RecorderLike;
}

function getNavigator(): MediaAccessLike | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator;
}

function getMediaRecorder() {
  return typeof MediaRecorder === 'undefined' ? undefined : MediaRecorder;
}
