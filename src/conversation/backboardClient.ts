import type { ResponseOption, Scenario } from '@/shared/contracts';
import type {
  KeyValueStorage,
  NpcBrain,
  NpcBrainReply,
  NpcBrainRequest,
} from '@/conversation/conversationTypes';

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface CreateBackboardNpcBrainOptions {
  endpoint?: string;
  fetcher?: FetchLike;
  storage?: KeyValueStorage;
}

interface BackboardMessageResponse {
  content?: string | null;
  status?: string;
  thread_id?: string;
  assistant_id?: string;
  retrieved_memories?: Array<{ content?: string; score?: number }>;
}

export function createBackboardNpcBrain({
  endpoint = '/api/backboard/messages',
  fetcher = globalThis.fetch.bind(globalThis),
  storage = getBrowserStorage(),
}: CreateBackboardNpcBrainOptions = {}): NpcBrain {
  return {
    async generateReply(request) {
      const keys = storageKeys(request.scenario);
      const threadId = storage?.getItem(keys.threadId) ?? undefined;
      const assistantId =
        storage?.getItem(keys.assistantId) ?? request.scenario.backboard?.assistantId;
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: buildTurnContent(request),
          thread_id: threadId || undefined,
          assistant_id: assistantId || undefined,
          system_prompt: buildSystemPrompt(request.scenario),
          stream: false,
          json_output: true,
          memory: request.scenario.backboard?.memoryMode ?? 'Auto',
          metadata: JSON.stringify({
            scenarioId: request.scenario.id,
            npcId: request.scenario.npc.id,
            turnId: request.turn.id,
            inputSource: request.inputSource,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`Backboard request failed with ${response.status}`);
      }

      const raw = (await response.json()) as BackboardMessageResponse;

      if (raw.status === 'FAILED') {
        throw new Error(getString(raw.content) || 'Backboard generation failed.');
      }

      const reply = normalizeBackboardResponse(raw);

      if (storage && raw.thread_id) {
        storage.setItem(keys.threadId, raw.thread_id);
      }
      if (storage && raw.assistant_id) {
        storage.setItem(keys.assistantId, raw.assistant_id);
      }

      return reply;
    },
  };
}

function buildSystemPrompt(scenario: Scenario) {
  return [
    `You are ${scenario.npc.name}, ${scenario.npc.role}.`,
    `Roleplay only as the NPC in ${scenario.destination}.`,
    'Language: French. Reply in French first, with a short English translation in JSON.',
    'The learner is an English-speaking French learner. Keep French short, realistic, and kind.',
    `Scene goal: ${scenario.goal}`,
    'Suggestions are optional coaching examples. React to what the learner actually said.',
    'Return only JSON with npcReply, feedback, suggestedResponses, scene, and memoryFacts.',
  ].join('\n');
}

function buildTurnContent(request: NpcBrainRequest) {
  return JSON.stringify(
    {
      scenario: {
        id: request.scenario.id,
        title: request.scenario.title,
        terminal: request.scenario.terminal,
        goal: request.scenario.goal,
        completionCriteria: request.scenario.completionCriteria,
      },
      npc: request.scenario.npc,
      currentTurn: {
        id: request.turn.id,
        hint: request.turn.goalHint,
        acceptedMeanings: request.turn.acceptedMeanings,
        suggestedReplies: request.turn.responses,
      },
      learner: {
        transcript: request.learnerText,
        inputSource: request.inputSource,
      },
      transcript: request.transcript.map((line) => ({
        speaker: line.speaker,
        text: line.text,
        translation: line.translation,
      })),
    },
    null,
    2,
  );
}

function normalizeBackboardResponse(raw: BackboardMessageResponse): NpcBrainReply {
  const parsed = parseContent(raw.content);
  const suggestedResponses = Array.isArray(parsed.suggestedResponses)
    ? parsed.suggestedResponses.map(normalizeSuggestion).filter(isResponseOption)
    : [];

  return {
    source: 'backboard',
    npcReply: {
      text: getString(parsed.npcReply?.text) || getString(raw.content) || 'Je suis desolee.',
      translation: getString(parsed.npcReply?.translation) || undefined,
    },
    feedback: {
      summary: getString(parsed.feedback?.summary) || undefined,
      correction: getString(parsed.feedback?.correction) || undefined,
    },
    suggestedResponses,
    scene: {
      complete: Boolean(parsed.scene?.complete),
      reason: getString(parsed.scene?.reason),
      score: clamp01(Number(parsed.scene?.score ?? 0)),
    },
    memoryFacts: Array.isArray(parsed.memoryFacts)
      ? parsed.memoryFacts.map((fact: unknown) => getString(fact)).filter(Boolean)
      : [],
    retrievedMemories: raw.retrieved_memories
      ?.map((memory) => ({ content: getString(memory.content), score: memory.score }))
      .filter((memory) => Boolean(memory.content)),
    threadId: raw.thread_id,
    assistantId: raw.assistant_id,
  };
}

function parseContent(content: string | null | undefined): Record<string, any> {
  const text = getString(content);

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(stripCodeFence(text));
  } catch {
    return { npcReply: { text } };
  }
}

function normalizeSuggestion(value: any): ResponseOption | null {
  const french = getString(value.french) || getString(value.target);
  const english = getString(value.english) || getString(value.translation);

  if (!french) {
    return null;
  }

  const label = normalizeLabel(value.label ?? value.difficulty);

  return {
    id: getString(value.id) || `suggestion-${label}-${normalizeId(french).slice(0, 24)}`,
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

function stripCodeFence(value: string) {
  return value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
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

function storageKeys(scenario: Scenario) {
  const prefix = `language-world:${scenario.id}:${scenario.npc.id}`;

  return {
    threadId: `${prefix}:thread-id`,
    assistantId: `${prefix}:assistant-id`,
  };
}

function getBrowserStorage(): KeyValueStorage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
