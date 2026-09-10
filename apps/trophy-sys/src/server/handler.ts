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

/**
 * Vercel's launcher caps a request body well above ours, so this only ever
 * measures something already in memory — the cost is bounded by the platform's
 * own limit, and the alternative is trusting a header the caller writes.
 */
const oversized = (body: unknown) => {
  try {
    // Byte length, not string length: `.length` counts UTF-16 code units, so a
    // body of multi-byte characters measures well under its real size.
    if (Buffer.isBuffer(body)) return body.length > BODY_MAX_BYTES;
    if (typeof body === 'string')
      return Buffer.byteLength(body) > BODY_MAX_BYTES;

    return Buffer.byteLength(JSON.stringify(body)) > BODY_MAX_BYTES;
  } catch {
    // Circular or unserialisable: not a shape any route of ours accepts.
    return true;
  }
};

const bodyRead = async (req: IncomingMessage): Promise<unknown> => {
  // Vercel's Node launcher parses a JSON body onto `req.body`; the local
  // `node:http` server does not, so the stream is the fallback, never the
  // first read — consuming an already-consumed stream hangs.
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  // Measured, not declared. On Vercel the launcher has already parsed the body
  // by the time this runs, so the byte-counting loop below never sees it — and
  // `content-length` is a client-supplied header, so a missing or understated
  // one walks straight past a check that trusts it. Production is the
  // deployment facing the open internet, so it gets the measurement.
  if (parsed !== undefined) return oversized(parsed) ? BODY_TOO_LARGE : parsed;

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
