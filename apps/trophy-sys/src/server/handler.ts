import { routeResolve } from './routes.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Node's `(req, res)` signature, because that is what Vercel's Node launcher
 * invokes — a web-standard handler returning a `Response` is silently dropped
 * and the request hangs. The local dev server mounts this same function.
 */
const bodyRead = async (req: IncomingMessage): Promise<unknown> => {
  // Vercel's Node launcher parses a JSON body onto `req.body`; the local
  // `node:http` server does not, so the stream is the fallback, never the
  // first read — consuming an already-consumed stream hangs.
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) return parsed;

  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const requestHandle = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  res.setHeader('content-type', 'application/json');

  try {
    const { status, body, headers } = await routeResolve(
      url,
      req.method ?? 'GET',
      {
        body: req.method === 'POST' ? await bodyRead(req) : null,
        headers: {
          cookie: req.headers.cookie,
          host: req.headers.host,
        },
      },
    );
    res.writeHead(status, headers).end(JSON.stringify(body));
  } catch (error) {
    res.writeHead(500).end(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default requestHandle;
