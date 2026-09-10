import { routeResolve } from './routes.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Node's `(req, res)` signature, because that is what Vercel's Node launcher
 * invokes — a web-standard handler returning a `Response` is silently dropped
 * and the request hangs. The local dev server mounts this same function.
 */
/**
 * The largest body any route legitimately takes is the complete hidden-id set —
 * 258 ids of ~20 characters, about 6 KB. 64 KB leaves an order of magnitude of
 * headroom and still refuses a payload sent to exhaust the process.
 */
const BODY_MAX_BYTES = 64 * 1024;

/** Distinguishable from a body that is legitimately null or unparseable. */
const BODY_TOO_LARGE = Symbol('body-too-large');

const bodyRead = async (req: IncomingMessage): Promise<unknown> => {
  // Vercel's Node launcher parses a JSON body onto `req.body`; the local
  // `node:http` server does not, so the stream is the fallback, never the
  // first read — consuming an already-consumed stream hangs.
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) return parsed;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    // Counted as it arrives, not after: every POST reaches this before any
    // route or cookie check, so an unauthenticated client could otherwise
    // spend the process's memory by never ending its body.
    if (size > BODY_MAX_BYTES) return BODY_TOO_LARGE;
    chunks.push(chunk as Buffer);
  }

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
    const body = req.method === 'POST' ? await bodyRead(req) : null;
    if (body === BODY_TOO_LARGE) {
      res.writeHead(413).end(JSON.stringify({ error: 'body too large' }));
      return;
    }

    const {
      status,
      body: answer,
      headers,
    } = await routeResolve(url, req.method ?? 'GET', {
      body,
      headers: {
        cookie: req.headers.cookie,
        host: req.headers.host,
      },
    });
    res.writeHead(status, headers).end(JSON.stringify(answer));
  } catch (error) {
    res.writeHead(500).end(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default requestHandle;
