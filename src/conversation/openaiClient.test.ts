import { describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { createOpenAiNpcBrain } from '@/conversation/openaiClient';

describe('createOpenAiNpcBrain', () => {
  it('posts the real learner turn to the OpenAI NPC endpoint and maps the structured reply', async () => {
    const fetcher = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));

      expect(body.learnerText).toBe('Je cherche le RER pour aller au centre-ville.');
      expect(body.scenario.id).toBe('airport-france');
      expect(body.scenario.personaPrompt).toContain('concise airport information-desk agent');
      expect(body.currentTurn.id).toBe('greeting');
      expect(body.transcript[0].speaker).toBe('npc');

      return new Response(
        JSON.stringify({
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
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const brain = createOpenAiNpcBrain({
      endpoint: '/api/openai/npc-turn',
      fetcher,
    });

    const reply = await brain.generateReply({
      scenario: airportFranceScenario,
      turn: airportFranceScenario.turns[0],
      transcript: [airportFranceScenario.turns[0].npcLine],
      learnerText: 'Je cherche le RER pour aller au centre-ville.',
      inputSource: 'typed',
    });

    expect(fetcher).toHaveBeenCalledWith('/api/openai/npc-turn', expect.any(Object));
    expect(reply.source).toBe('openai');
    expect(reply.npcReply.text).toBe('Tres bien. Le RER B est par ici.');
    expect(reply.suggestedResponses[0]).toMatchObject({
      label: 'easy',
      french: 'Merci beaucoup.',
      english: 'Thank you very much.',
    });
    expect(reply.scene.complete).toBe(true);
  });
});
