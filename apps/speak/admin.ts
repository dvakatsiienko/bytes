// the voice admin's handler: the built page, and the daemon's control socket as an api. no state and no file of its
// own: the daemon owns the settings. server.ts hands it this mac's paths and listens
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createConnection } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';

import type { IncomingMessage, ServerResponse } from 'node:http';

// female only (dima's blind test). elevenlabs premades answered 200 on the restricted key; charlotte and aria are
// library voices (402). kokoro: every af_/bf_ voice answered on the warm server (2026-09-29)
const VOICES = {
  elevenlabs: [
    ['EXAVITQu4vr4xnSDxMaL', 'Sarah'],
    ['FGY2WhTYpPnrIDTdsKH5', 'Laura'],
    ['Xb7hH8MSUJpSbSDYk0k2', 'Alice'],
    ['XrExE9yKIg1WjnnlVkGX', 'Matilda'],
    ['cgSgspJ2msm6clMCkdW9', 'Jessica'],
    ['pFZP5JQG7iQjIQuC4Bku', 'Lily'],
  ],
  // fish's library is community clones, only as good as the uploaded clip; dima kept Sarah alone after a listen
  // (2026-09-29). s2 reads any language in her voice
  fish: [['933563129e564b19a115bedd57b7406a', 'Sarah']],
  gemini: [
    ['Kore', 'Kore'],
    ['Aoede', 'Aoede'],
    ['Leda', 'Leda'],
    ['Zephyr', 'Zephyr'],
  ],
  kokoro: [
    'af_heart',
    'af_bella',
    'af_nicole',
    'af_sarah',
    'af_sky',
    'af_nova',
    'af_river',
    'af_jessica',
    'af_alloy',
    'af_aoede',
    'af_kore',
    'bf_emma',
    'bf_isabella',
    'bf_alice',
    'bf_lily',
  ].map((id) => [id, id]),
} satisfies Record<string, string[][]>;

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
  for await (const chunk of request) text += chunk;
  return JSON.parse(text || '{}');
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
      'GET /api/voices': async () => ({
        ...VOICES,
        system: (await daemon('voices')).system ?? [],
      }),
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

// where this server's page and its daemon are. a worktree's server reaches the live daemon to play, never to save
export const adminPaths = ({ app, home, own }: AdminPlace): AdminPaths => {
  const live = join(home, '.local/share/x-speak/control.sock');
  // a worktree's .git is a file that names the main checkout's
  const git = join(app, '../../.git');
  const isWorktree = existsSync(git) && statSync(git).isFile();
  const socket = own ?? live;
  return {
    canSave: !isWorktree || resolve(socket) !== live,
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
