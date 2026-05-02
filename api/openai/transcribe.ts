const OPENAI_BASE_URL = 'https://api.openai.com/v1';

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

  const contentType = getHeader(req, 'content-type');

  if (!contentType?.includes('multipart/form-data')) {
    sendJson(res, 400, { error: 'Expected multipart/form-data audio upload.' });
    return;
  }

  try {
    const upstream = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
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
      error: error instanceof Error ? error.message : 'OpenAI transcription request failed.',
    });
  }
}

async function readRequestBytes(req: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return new Blob(chunks);
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
