import type { SpeechInput } from '@/conversation/conversationTypes';
import { createOpenAiSpeechInput } from '@/conversation/openaiSpeechInput';
import { createBrowserSpeechInput } from '@/conversation/speechInput';

export function createDefaultSpeechInput(): SpeechInput {
  const openai = createOpenAiSpeechInput();
  const browser = createBrowserSpeechInput();

  return {
    isSupported: () => openai.isSupported() || browser.isSupported(),
    stop: () => {
      openai.stop();
      browser.stop();
    },
    async listen(options) {
      if (openai.isSupported()) {
        try {
          return await openai.listen(options);
        } catch (error) {
          if (!browser.isSupported()) {
            throw error;
          }
        }
      }

      return browser.listen(options);
    },
  };
}
