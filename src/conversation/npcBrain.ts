import { createDemoNpcBrain } from '@/conversation/fallbackNpcBrain';
import { createBackboardNpcBrain } from '@/conversation/backboardClient';
import { createOpenAiNpcBrain } from '@/conversation/openaiClient';
import type { NpcBrain } from '@/conversation/conversationTypes';

export function createDefaultNpcBrain(): NpcBrain {
  const backboard = createBackboardNpcBrain();
  const openai = createOpenAiNpcBrain();
  const fallback = createDemoNpcBrain();

  return {
    async generateReply(request) {
      try {
        return await backboard.generateReply(request);
      } catch (error) {
        console.warn('Backboard unavailable; using OpenAI NPC brain.', error);
      }

      try {
        return await openai.generateReply(request);
      } catch (error) {
        console.warn('OpenAI unavailable; using demo NPC brain.', error);
        return fallback.generateReply(request);
      }
    },
  };
}
