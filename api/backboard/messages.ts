const BACKBOARD_BASE_URL = 'https://app.backboard.io/api';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = getEnv('BACKBOARD_API_KEY');

  if (!apiKey) {
    res.status(503).json({ error: 'BACKBOARD_API_KEY is not configured.' });
    return;
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const upstream = await fetch(`${BACKBOARD_BASE_URL}/threads/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(payload),
  });
  const contentType = upstream.headers.get('content-type') ?? 'application/json';
  const text = await upstream.text();

  res.status(upstream.status).setHeader('Content-Type', contentType).send(text);
}

function getEnv(name: string) {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string> } }).process
    ?.env?.[name];
}
