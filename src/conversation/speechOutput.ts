import type { TranscriptLine } from '@/shared/contracts';
import type { SpeechOutput } from '@/conversation/conversationTypes';

interface BrowserSpeechOutputOptions {
  synth?: SpeechSynthesis;
  utteranceFactory?: (text: string) => SpeechSynthesisUtterance;
}

export function createBrowserSpeechOutput({
  synth = getBrowserSpeechSynthesis(),
  utteranceFactory = (text) => new SpeechSynthesisUtterance(text),
}: BrowserSpeechOutputOptions = {}): SpeechOutput {
  return {
    isSupported: () => Boolean(synth && typeof utteranceFactory === 'function'),
    cancel: () => synth?.cancel(),
    speak(line: TranscriptLine, options = {}) {
      if (!synth) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const utterance = utteranceFactory(line.text);
        utterance.lang = options.lang ?? 'fr-FR';
        utterance.voice = chooseVoice(synth, utterance.lang);
        utterance.rate = 0.94;
        utterance.pitch = 1.02;
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));
        synth.cancel();
        synth.speak(utterance);
      });
    },
  };
}

function chooseVoice(synth: SpeechSynthesis, lang: string) {
  const voices = synth.getVoices();
  const prefix = lang.split('-')[0]?.toLowerCase();

  return (
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${prefix}-`)) ??
    null
  );
}

function getBrowserSpeechSynthesis() {
  return typeof window !== 'undefined' ? window.speechSynthesis : undefined;
}
