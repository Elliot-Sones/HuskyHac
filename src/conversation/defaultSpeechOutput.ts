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
      if (options?.preferBrowser && browser.isSupported()) {
        try {
          await browser.speak(line, options);
          return;
        } catch (error) {
          console.warn('Browser speech unavailable; using OpenAI speech synthesis.', error);
        }
      }

      try {
        await openai.speak(line, options);
      } catch (error) {
        console.warn('OpenAI speech unavailable; using browser speech synthesis.', error);
        await browser.speak(line, options);
      }
    },
  };
}
