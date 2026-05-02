import { afterEach, describe, expect, it, vi } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import type { NpcBrain, NpcBrainReply } from '@/conversation/conversationTypes';

const mocks = vi.hoisted(() => {
  const backboard: NpcBrain = { generateReply: vi.fn() };
  const openai: NpcBrain = { generateReply: vi.fn() };
  const fallback: NpcBrain = { generateReply: vi.fn() };

  return { backboard, openai, fallback };
});

vi.mock('@/conversation/backboardClient', () => ({
  createBackboardNpcBrain: () => mocks.backboard,
}));

vi.mock('@/conversation/openaiClient', () => ({
  createOpenAiNpcBrain: () => mocks.openai,
}));

vi.mock('@/conversation/fallbackNpcBrain', () => ({
  createDemoNpcBrain: () => mocks.fallback,
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('createDefaultNpcBrain', () => {
  it('tries Backboard first and falls back to OpenAI when Backboard is unavailable', async () => {
    const reply = makeReply('openai');
    vi.mocked(mocks.backboard.generateReply).mockRejectedValueOnce(new Error('credits'));
    vi.mocked(mocks.openai.generateReply).mockResolvedValueOnce(reply);

    const { createDefaultNpcBrain } = await import('@/conversation/npcBrain');
    const brain = createDefaultNpcBrain();
    const result = await brain.generateReply({
      scenario: airportFranceScenario,
      turn: airportFranceScenario.turns[0],
      transcript: [airportFranceScenario.turns[0].npcLine],
      learnerText: 'Bonjour.',
      inputSource: 'typed',
    });

    expect(result).toBe(reply);
    expect(mocks.backboard.generateReply).toHaveBeenCalledOnce();
    expect(mocks.openai.generateReply).toHaveBeenCalledOnce();
    expect(mocks.fallback.generateReply).not.toHaveBeenCalled();
  });

  it('falls back to OpenAI when Backboard is too slow', async () => {
    vi.useFakeTimers();
    const reply = makeReply('openai');
    vi.mocked(mocks.backboard.generateReply).mockImplementationOnce(
      () => new Promise(() => {}),
    );
    vi.mocked(mocks.openai.generateReply).mockResolvedValueOnce(reply);

    const { createDefaultNpcBrain } = await import('@/conversation/npcBrain');
    const brain = createDefaultNpcBrain();
    const resultPromise = brain.generateReply({
      scenario: airportFranceScenario,
      turn: airportFranceScenario.turns[0],
      transcript: [airportFranceScenario.turns[0].npcLine],
      learnerText: 'Bonjour.',
      inputSource: 'typed',
    });

    await vi.advanceTimersByTimeAsync(1000);

    await expect(resultPromise).resolves.toBe(reply);
    expect(mocks.openai.generateReply).toHaveBeenCalledOnce();
  });
});

function makeReply(source: NpcBrainReply['source']): NpcBrainReply {
  return {
    source,
    npcReply: {
      text: 'Tres bien. Le RER B est par ici.',
      translation: 'Very good. The RER B is this way.',
    },
    feedback: {},
    suggestedResponses: [],
    scene: { complete: false, reason: '', score: 0 },
    memoryFacts: [],
  };
}
