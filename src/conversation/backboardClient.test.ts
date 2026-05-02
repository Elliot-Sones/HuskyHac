import { describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { createBackboardNpcBrain } from '@/conversation/backboardClient';
import type { KeyValueStorage } from '@/conversation/conversationTypes';

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('createBackboardNpcBrain', () => {
  it('posts the real learner turn to the Backboard proxy with memory and persists ids', async () => {
    const storage = new MemoryStorage();
    const fetcher = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));

      expect(body.memory).toBe('Auto');
      expect(body.json_output).toBe(true);
      expect(body.system_prompt).toContain('Mme. Laurent');
      expect(body.system_prompt).toContain('French');
      expect(body.content).toContain('Je cherche le RER pour aller au centre-ville.');
      expect(body.content).toContain('airport-france');
      expect(body.thread_id).toBeUndefined();

      return new Response(
        JSON.stringify({
          status: 'COMPLETED',
          thread_id: 'thread-abc',
          assistant_id: 'assistant-abc',
          content: JSON.stringify({
            npcReply: {
              text: 'Tres bien. Le RER B est par ici.',
              translation: 'Very good. The RER B is this way.',
            },
            feedback: { summary: 'Clear and polite.' },
            suggestedResponses: [
              {
                difficulty: 'easy',
                target: 'Merci beaucoup.',
                translation: 'Thank you very much.',
              },
            ],
            scene: { complete: true, reason: 'Transport intent satisfied.', score: 0.92 },
            memoryFacts: ['Learner can ask for the RER.'],
          }),
          retrieved_memories: [{ content: 'Learner prefers short replies.' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const brain = createBackboardNpcBrain({
      endpoint: '/api/backboard/messages',
      fetcher,
      storage,
    });

    const reply = await brain.generateReply({
      scenario: airportFranceScenario,
      turn: airportFranceScenario.turns[0],
      transcript: [airportFranceScenario.turns[0].npcLine],
      learnerText: 'Je cherche le RER pour aller au centre-ville.',
      inputSource: 'typed',
    });

    expect(fetcher).toHaveBeenCalledWith('/api/backboard/messages', expect.any(Object));
    expect(reply.npcReply.text).toBe('Tres bien. Le RER B est par ici.');
    expect(reply.suggestedResponses[0]).toMatchObject({
      label: 'easy',
      french: 'Merci beaucoup.',
      english: 'Thank you very much.',
    });
    expect(reply.scene.complete).toBe(true);
    expect(reply.threadId).toBe('thread-abc');
    expect(reply.assistantId).toBe('assistant-abc');
    expect(reply.retrievedMemories?.[0]?.content).toBe('Learner prefers short replies.');
    expect(storage.getItem('language-world:airport-france:mme-laurent:thread-id')).toBe(
      'thread-abc',
    );
    expect(storage.getItem('language-world:airport-france:mme-laurent:assistant-id')).toBe(
      'assistant-abc',
    );
  });
});
