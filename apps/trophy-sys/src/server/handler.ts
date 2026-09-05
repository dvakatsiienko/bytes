import { routeResolve } from './routes.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Node's `(req, res)` signature, because that is what Vercel's Node launcher
 * invokes — a web-standard handler returning a `Response` is silently dropped
 * and the request hangs. The local dev server mounts this same function.
 */
const requestHandle = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  res.setHeader('content-type', 'application/json');

  try {
    const { status, body, headers } = await routeResolve(
      url,
      req.method ?? 'GET',
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
