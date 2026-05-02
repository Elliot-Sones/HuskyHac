const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_TTS_MODEL = 'gpt-4o-mini-tts';
const DEFAULT_TTS_VOICE = 'marin';

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
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

    if (!text) {
      sendJson(res, 400, { error: 'Missing text.' });
      return;
    }

    const upstream = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getEnv('OPENAI_TTS_MODEL') || DEFAULT_TTS_MODEL,
        voice: getEnv('OPENAI_TTS_VOICE') || DEFAULT_TTS_VOICE,
        input: text,
        instructions:
          'Speak as a calm French airport information-desk agent. Use clear Parisian French, warm but concise.',
        response_format: 'mp3',
      }),
    });
    const arrayBuffer = await upstream.arrayBuffer();

    res.statusCode = upstream.status;
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'audio/mpeg');
    res.end(new Uint8Array(arrayBuffer));
  } catch (error) {
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : 'OpenAI speech request failed.',
    });
  }
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
