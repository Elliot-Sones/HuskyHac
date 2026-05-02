/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react(), backboardDevProxy()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'ws://127.0.0.1:8787',
        ws: true,
      },
    },
  },
  test: {
    exclude: [...configDefaults.exclude, 'tests/e2e/**', 'mock/**', 'dist-server/**'],
  },
});

function backboardDevProxy(): Plugin {
  return {
    name: 'backboard-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/openai/npc-turn', async (req: any, res: any) => {
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
          const payload = await readRequestJson(req);
          const upstream = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildOpenAiResponsesPayload(payload)),
          });
          const json = await upstream.json();

          if (!upstream.ok) {
            sendJson(res, upstream.status, json);
            return;
          }

          sendJson(res, 200, normalizeNpcReply(extractOutputText(json)));
        } catch (error) {
          sendJson(res, 502, {
            error: error instanceof Error ? error.message : 'OpenAI NPC proxy failed.',
          });
        }
      });

      server.middlewares.use('/api/openai/tts', async (req: any, res: any) => {
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
          const payload = await readRequestJson(req);
          const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

          if (!text) {
            sendJson(res, 400, { error: 'Missing text.' });
            return;
          }

          const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: getEnv('OPENAI_TTS_MODEL') || 'gpt-4o-mini-tts',
              voice: getEnv('OPENAI_TTS_VOICE') || 'marin',
              input: text,
              instructions:
                'Speak as a calm French airport information-desk agent. Use clear Parisian French, warm but concise.',
              response_format: 'mp3',
            }),
          });
          const bytes = new Uint8Array(await upstream.arrayBuffer());

          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'audio/mpeg');
          res.end(bytes);
        } catch (error) {
          sendJson(res, 502, {
            error: error instanceof Error ? error.message : 'OpenAI speech proxy failed.',
          });
        }
      });

      server.middlewares.use('/api/openai/transcribe', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        const apiKey = getEnv('OPENAI_API_KEY');

        if (!apiKey) {
          sendJson(res, 503, { error: 'OPENAI_API_KEY is not configured.' });
          return;
        }

        const contentType = getHeader(req, 'content-type');

        if (!contentType?.includes('multipart/form-data')) {
          sendJson(res, 400, { error: 'Expected multipart/form-data audio upload.' });
          return;
        }

        try {
          const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': contentType,
            },
            body: await readRequestBytes(req),
          });
          const text = await upstream.text();

          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
          res.end(text);
        } catch (error) {
          sendJson(res, 502, {
            error: error instanceof Error ? error.message : 'OpenAI transcription proxy failed.',
          });
        }
      });

      server.middlewares.use('/api/backboard/messages', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' });
          return;
        }

        const apiKey = getEnv('BACKBOARD_API_KEY');

        if (!apiKey) {
          sendJson(res, 503, { error: 'BACKBOARD_API_KEY is not configured.' });
          return;
        }

        try {
          const payload = await readRequestJson(req);
          const upstream = await fetch('https://app.backboard.io/api/threads/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify(payload),
          });
          const text = await upstream.text();

          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
          res.end(text);
        } catch (error) {
          sendJson(res, 502, {
            error: error instanceof Error ? error.message : 'Backboard proxy failed.',
          });
        }
      });
    },
  };
}

function buildOpenAiResponsesPayload(payload: any) {
  return {
    model: getEnv('OPENAI_LLM_MODEL') || 'gpt-4o-mini',
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

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

async function readRequestJson(req: AsyncIterable<Uint8Array>) {
  const decoder = new TextDecoder();
  let body = '';

  for await (const chunk of req) {
    body += decoder.decode(chunk, { stream: true });
  }
  body += decoder.decode();

  return body ? JSON.parse(body) : {};
}

async function readRequestBytes(req: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return new Blob(
    chunks.map((chunk) => {
      const copy = new Uint8Array(chunk.byteLength);
      copy.set(chunk);
      return copy.buffer;
    }),
  );
}

function getHeader(req: any, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(res: any, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function getEnv(name: string) {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string> } }).process
    ?.env?.[name];
}
