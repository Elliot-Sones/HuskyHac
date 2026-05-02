import { describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { runNpcConversationTurn } from '@/conversation/conversationFlow';
import type { NpcBrain, SpeechOutput } from '@/conversation/conversationTypes';
import type { ResponseOption } from '@/shared/contracts';

describe('runNpcConversationTurn', () => {
  it('uses the learner transcript, asks the NPC brain for a French reply, and speaks it aloud', async () => {
    const brain: NpcBrain = {
      generateReply: vi.fn(async (request) => {
        expect(request.learnerText).toBe('Je voudrais aller au centre-ville.');
        expect(request.turn.id).toBe('greeting');
        expect(request.scenario.npc.name).toBe('Mme. Laurent');
        expect(request.transcript.at(-1)?.speaker).toBe('npc');

        return {
          npcReply: {
            text: 'Bien sur. Prenez le RER B vers Paris.',
            translation: 'Of course. Take the RER B toward Paris.',
          },
          feedback: {
            summary: 'Good travel intent.',
            correction: 'Je voudrais aller au centre-ville.',
          },
          suggestedResponses: [
            {
              id: 'ask-ticket-dynamic',
              label: 'natural',
              french: 'Ou puis-je acheter un billet ?',
              english: 'Where can I buy a ticket?',
              recommended: true,
            },
          ] satisfies ResponseOption[],
          scene: {
            complete: false,
            reason: 'Needs ticket follow-up.',
            score: 0.45,
          },
          memoryFacts: ['Learner asked for central Paris.'],
          threadId: 'thread-123',
          assistantId: 'assistant-123',
          source: 'openai' as const,
        };
      }),
    };
    const speechOutput: SpeechOutput = {
      speak: vi.fn(async () => undefined),
      cancel: vi.fn(),
      isSupported: () => true,
    };

    const result = await runNpcConversationTurn({
      scenario: airportFranceScenario,
      turnIndex: 0,
      transcript: [airportFranceScenario.turns[0].npcLine],
      learnerText: 'Je voudrais aller au centre-ville.',
      inputSource: 'typed',
      brain,
      speechOutput,
    });

    expect(result.playerLine).toMatchObject({
      speaker: 'player',
      text: 'Je voudrais aller au centre-ville.',
      source: 'typed',
    });
    expect(result.npcLine).toMatchObject({
      speaker: 'npc',
      text: 'Bien sur. Prenez le RER B vers Paris.',
      translation: 'Of course. Take the RER B toward Paris.',
      source: 'openai',
    });
    expect(result.suggestedResponses[0]?.french).toBe('Ou puis-je acheter un billet ?');
    expect(result.progress).toBe(45);
    expect(result.complete).toBe(false);
    expect(speechOutput.speak).toHaveBeenCalledWith(result.npcLine, { lang: 'fr-FR' });
  });
});
