// the voice admin's handler: the built page, and the daemon's control socket as an api. no state and no file of its
// own: the daemon owns the settings. server.ts hands it this mac's paths and listens
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createConnection } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';

import { isWorktree } from './ports.ts';
import type { IncomingMessage, ServerResponse } from 'node:http';

const TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const NO_ANSWER = { error: 'x-speak closed the line before it answered' };

// a status and the voices are their own answer; any other op says ok or why not
function answerOf(line: string, op: string): Record<string, unknown> {
  try {
    const reply = JSON.parse(line);
    const says =
      op === 'status' || op === 'voices'
        ? Object.keys(reply).length > 0
        : reply.ok;
    return says || reply.error ? reply : NO_ANSWER;
  } catch {
    return NO_ANSWER;
  }
}

function askDaemon(socketPath: string, request: { op: string }) {
  return new Promise<Record<string, unknown>>((answer) => {
    const socket = createConnection(socketPath);
    let reply = '';
    socket.setEncoding('utf8');
    socket.setTimeout(3000, () =>
      socket.destroy(new Error('the daemon did not answer in 3 s')),
    );
    socket.on('connect', () => socket.write(`${JSON.stringify(request)}\n`));
    socket.on('data', (chunk) => {
      reply += chunk;
    });
    socket.on('end', () => answer(answerOf(reply, request.op)));
    socket.on('error', (error) =>
      answer({ error: `x-speak is not reachable — ${error.message}` }),
    );
  });
}

async function body(request: IncomingMessage) {
  let text = '';
  request.setEncoding('utf8');
  for await (const chunk of request) text += chunk;
  // json has no infinity: a number past a double's range would travel on as null, and null takes a key out
  return JSON.parse(text || '{}', (_, value) => {
    if (
      value === Number.POSITIVE_INFINITY ||
      value === Number.NEGATIVE_INFINITY
    )
      throw new Error('a number is out of range');
    return value;
  });
}

function send(
  response: ServerResponse,
  status: number,
  payload: unknown,
  type = 'application/json',
) {
  response.writeHead(status, { 'content-type': type });
  response.end(type === 'application/json' ? JSON.stringify(payload) : payload);
}

// the page folder only: a path that normalises outside it is a 404, never a read
function sendStatic(response: ServerResponse, dist: string, url: string) {
  const path = decodeURIComponent(url.split('?')[0] ?? '');
  const file = normalize(join(dist, path === '/' ? 'index.html' : path));
  if (!(file.startsWith(`${dist}/`) && existsSync(file)))
    return send(response, 404, { error: 'not found' });
  send(
    response,
    200,
    readFileSync(file),
    TYPES[extname(file)] ?? 'application/octet-stream',
  );
}

// another page can point its own name at this mac, and the browser then calls it same-origin: the name gives it away
const OWN_HOST = /^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/u;

export const createAdmin = ({ canSave, dist, socket }: AdminPaths) => {
  const daemon = (op: string, request: object = {}) =>
    askDaemon(socket, { ...request, op });
  const ask = (op: string) => async (request: IncomingMessage) =>
    daemon(op, await body(request));
  const save = (op: string) => async (request: IncomingMessage) =>
    canSave ? ask(op)(request) : { error: WORKTREE };

  const routes: Record<string, (request: IncomingMessage) => Promise<unknown>> =
    {
      'GET /api/config': async () => daemon('config'),
      'GET /api/status': async () => daemon('status'),
      'GET /api/voices': async () => daemon('voices'),
      'POST /api/pause': ask('pause'),
      'POST /api/preview': ask('preview'),
      'POST /api/stop': ask('stop'),
      'POST /api/wave': ask('wave'),
      'PUT /api/config': save('save'),
      'PUT /api/favourites': save('heart'),
    };

  return async (request: IncomingMessage, response: ServerResponse) => {
    if (!OWN_HOST.test(request.headers.host ?? ''))
      return send(response, 403, { error: 'this server answers on localhost' });
    // a write must say it is json: a browser sends that header cross-origin only after a preflight, which this
    // server never answers, so no other page can drive the daemon or save the config
    if (
      request.method !== 'GET' &&
      !request.headers['content-type']?.startsWith('application/json')
    )
      return send(response, 415, { error: 'send application/json' });
    try {
      const route = routes[`${request.method} ${request.url}`];
      if (route) return send(response, 200, await route(request));
      if (request.method === 'GET' && !request.url?.startsWith('/api/'))
        return sendStatic(response, dist, request.url ?? '/');
      send(response, 404, { error: 'not found' });
    } catch (error) {
      send(response, 400, { error: (error as Error).message });
    }
  };
};

const WORKTREE =
  'a worktree never saves the live settings — start its server with a socket of its own';

// a link to the live socket is the live socket
const canonical = (path: string) =>
  existsSync(path) ? realpathSync.native(path) : resolve(path);

// where this server's page and its daemon are. a worktree's server reaches the live daemon to play, never to save
export const adminPaths = ({ app, home, own }: AdminPlace): AdminPaths => {
  const live = join(home, '.local/share/x-speak/control.sock');
  const socket = own ?? live;
  return {
    canSave: !isWorktree(app) || canonical(socket) !== canonical(live),
    dist: join(app, 'dist'),
    socket,
  };
};

/* Types */
interface AdminPlace {
  app: string;
  home: string;
  // a socket of this server's own, a fake daemon's
  own?: string;
}

export interface AdminPaths {
  canSave: boolean;
  dist: string;
  socket: string;
}
