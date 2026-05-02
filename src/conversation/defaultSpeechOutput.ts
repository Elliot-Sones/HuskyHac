import { createBrowserSpeechOutput } from '@/conversation/speechOutput';
import { createOpenAiSpeechOutput } from '@/conversation/openaiSpeechOutput';
import type { SpeechOutput } from '@/conversation/conversationTypes';

export function createDefaultSpeechOutput(): SpeechOutput {
  const openai = createOpenAiSpeechOutput();
  const browser = createBrowserSpeechOutput();

  return {
    isSupported: () => openai.isSupported() || browser.isSupported(),
    cancel: () => {
      openai.cancel();
      browser.cancel();
    },
    async speak(line, options) {
      try {
        await openai.speak(line, options);
      } catch (error) {
        console.warn('OpenAI speech unavailable; using browser speech synthesis.', error);
        await browser.speak(line, options);
      }
    },
  };
}
