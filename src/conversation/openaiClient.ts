import type { ResponseOption, Scenario } from '@/shared/contracts';
import type {
  NpcBrain,
  NpcBrainReply,
  NpcBrainRequest,
} from '@/conversation/conversationTypes';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface CreateOpenAiNpcBrainOptions {
  endpoint?: string;
  fetcher?: FetchLike;
}

export function createOpenAiNpcBrain({
  endpoint = '/api/openai/npc-turn',
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateOpenAiNpcBrainOptions = {}): NpcBrain {
  return {
    async generateReply(request) {
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildNpcTurnPayload(request)),
      });

      if (!response.ok) {
        throw new Error(`OpenAI NPC request failed with ${response.status}`);
      }

      return normalizeOpenAiReply(await response.json());
    },
  };
}

function buildNpcTurnPayload(request: NpcBrainRequest) {
  return {
    learnerText: request.learnerText,
    inputSource: request.inputSource,
    scenario: serializeScenario(request.scenario),
    currentTurn: {
      id: request.turn.id,
      goalHint: request.turn.goalHint,
      acceptedMeanings: request.turn.acceptedMeanings,
      suggestedReplies: request.turn.responses,
    },
    transcript: request.transcript.map((line) => ({
      speaker: line.speaker,
      text: line.text,
      translation: line.translation,
    })),
  };
}

function serializeScenario(scenario: Scenario) {
  return {
    id: scenario.id,
    title: scenario.title,
    destination: scenario.destination,
    terminal: scenario.terminal,
    goal: scenario.goal,
    language: scenario.language,
    npc: scenario.npc,
    personaPrompt: scenario.personaPrompt,
    completionCriteria: scenario.completionCriteria,
  };
}

function normalizeOpenAiReply(value: any): NpcBrainReply {
  const suggestedResponses = Array.isArray(value.suggestedResponses)
    ? value.suggestedResponses.map(normalizeSuggestion).filter(isResponseOption)
    : [];

  return {
    source: 'openai',
    npcReply: {
      text: getString(value.npcReply?.text) || 'Je suis desolee.',
      translation: getString(value.npcReply?.translation) || undefined,
    },
    feedback: {
      summary: getString(value.feedback?.summary) || undefined,
      correction: getString(value.feedback?.correction) || undefined,
    },
    suggestedResponses,
    scene: {
      complete: Boolean(value.scene?.complete),
      reason: getString(value.scene?.reason),
      score: clamp01(Number(value.scene?.score ?? 0)),
    },
    memoryFacts: Array.isArray(value.memoryFacts)
      ? value.memoryFacts.map((fact: unknown) => getString(fact)).filter(Boolean)
      : [],
  };
}

function normalizeSuggestion(value: any): ResponseOption | null {
  const french = getString(value.french) || getString(value.target);
  const english = getString(value.english) || getString(value.translation);

  if (!french || !english) {
    return null;
  }

  const label = normalizeLabel(value.label ?? value.difficulty);

  return {
    id: getString(value.id) || `openai-${label}-${normalizeId(french).slice(0, 24)}`,
    label,
    french,
    english,
    recommended: Boolean(value.recommended),
  };
}

function isResponseOption(value: ResponseOption | null): value is ResponseOption {
  return value !== null;
}

function normalizeLabel(value: unknown): ResponseOption['label'] {
  return value === 'easy' || value === 'challenge' ? value : 'natural';
}

function normalizeId(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}
