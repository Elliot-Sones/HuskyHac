import { createDemoNpcBrain } from '@/conversation/fallbackNpcBrain';
import { createBackboardNpcBrain } from '@/conversation/backboardClient';
import { createOpenAiNpcBrain } from '@/conversation/openaiClient';
import type { NpcBrain } from '@/conversation/conversationTypes';

const BACKBOARD_REPLY_TIMEOUT_MS = 900;

export function createDefaultNpcBrain(): NpcBrain {
  const backboard = createBackboardNpcBrain();
  const openai = createOpenAiNpcBrain();
  const fallback = createDemoNpcBrain();

  return {
    async generateReply(request) {
      try {
        return await withTimeout(
          backboard.generateReply(request),
          BACKBOARD_REPLY_TIMEOUT_MS,
          'Backboard response timed out.',
        );
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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}
