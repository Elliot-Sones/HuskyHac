import { createDemoNpcBrain } from '@/conversation/fallbackNpcBrain';
import { createOpenAiNpcBrain } from '@/conversation/openaiClient';
import type { NpcBrain } from '@/conversation/conversationTypes';

export function createDefaultNpcBrain(): NpcBrain {
  const openai = createOpenAiNpcBrain();
  const fallback = createDemoNpcBrain();

  return {
    async generateReply(request) {
      try {
        return await openai.generateReply(request);
      } catch (error) {
        console.warn('OpenAI unavailable; using demo NPC brain.', error);
        return fallback.generateReply(request);
      }
    },
  };
}
