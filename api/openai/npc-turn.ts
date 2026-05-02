const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_LLM_MODEL = 'gpt-4o-mini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = getEnv('OPENAI_API_KEY');

  if (!apiKey) {
    sendJson(res, 503, { error: 'OPENAI_API_KEY is not configured.' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const upstream = await fetch(`${OPENAI_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildResponsesPayload(payload)),
    });
    const json = await upstream.json();

    if (!upstream.ok) {
      sendJson(res, upstream.status, json);
      return;
    }

    sendJson(res, 200, normalizeNpcReply(extractOutputText(json)));
  } catch (error) {
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : 'OpenAI NPC request failed.',
    });
  }
}

export function buildResponsesPayload(payload: any) {
  return {
    model: getEnv('OPENAI_LLM_MODEL') || DEFAULT_LLM_MODEL,
    input: [
      {
        role: 'developer',
        content: buildNpcInstructions(payload),
      },
      {
        role: 'user',
        content: JSON.stringify(payload, null, 2),
      },
    ],
    text: {
      format: { type: 'json_object' },
    },
  };
}

function buildNpcInstructions(payload: any) {
  const npcName = payload?.scenario?.npc?.name ?? 'Mme. Laurent';
  const role = payload?.scenario?.npc?.role ?? 'airport information-desk agent';
  const goal = payload?.scenario?.goal ?? 'Help the learner ask for airport transport.';
  const persona = payload?.scenario?.personaPrompt ?? '';

  return [
    `You are ${npcName}, a ${role}.`,
    persona,
    'Reply as a realistic airport NPC in French. Keep French short and A1-A2 friendly.',
    'React to the learner transcript, not just to the suggested replies.',
    'Offer gentle correction only when useful. Stay focused on airport transport to central Paris.',
    `Scene goal: ${goal}`,
    'You must return valid JSON only.',
    'JSON shape: {"npcReply":{"text":"French reply","translation":"English translation"},"feedback":{"summary":"short note","correction":"optional corrected French"},"suggestedResponses":[{"difficulty":"easy|natural|challenge","target":"French phrase","translation":"English phrase","recommended":true}],"scene":{"complete":false,"reason":"why","score":0.0},"memoryFacts":["short durable learning fact"]}',
  ]
    .filter(Boolean)
    .join('\n');
}

function normalizeNpcReply(outputText: string) {
  const parsed = parseJsonObject(outputText);

  return {
    npcReply: {
      text: getString(parsed.npcReply?.text) || 'Je suis desolee, pouvez-vous repeter ?',
      translation: getString(parsed.npcReply?.translation),
    },
    feedback: {
      summary: getString(parsed.feedback?.summary),
      correction: getString(parsed.feedback?.correction),
    },
    suggestedResponses: Array.isArray(parsed.suggestedResponses)
      ? parsed.suggestedResponses.slice(0, 3)
      : [],
    scene: {
      complete: Boolean(parsed.scene?.complete),
      reason: getString(parsed.scene?.reason),
      score: clamp01(Number(parsed.scene?.score ?? 0)),
    },
    memoryFacts: Array.isArray(parsed.memoryFacts) ? parsed.memoryFacts.slice(0, 5) : [],
  };
}

function extractOutputText(response: any) {
  if (typeof response.output_text === 'string') {
    return response.output_text;
  }

  const parts: string[] = [];

  for (const output of response.output ?? []) {
    for (const item of output.content ?? []) {
      if (item.type === 'output_text' && typeof item.text === 'string') {
        parts.push(item.text);
      }
    }
  }

  return parts.join('\n');
}

function parseJsonObject(value: string) {
  try {
    return JSON.parse(value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim());
  } catch {
    return {};
  }
}

function sendJson(res: any, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
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

function getEnv(name: string) {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string> } }).process
    ?.env?.[name];
}
