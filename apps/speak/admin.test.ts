import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { type Server, createServer, request } from 'node:http';
import {
  type AddressInfo,
  type Server as SocketServer,
  createServer as createSocket,
} from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { adminPaths, createAdmin } from './admin.ts';

const SETTINGS = {
  chain: { en: ['kokoro'] },
  engines: { kokoro: { gain: 2 } },
  firstAudioMs: 900,
};
const JSON_TYPE = { 'content-type': 'application/json' };

let home: string;
let admin: Server;
let fakeDaemon: SocketServer;
let asked: unknown[];
let replies: Record<string, unknown>;
// the daemon's line as bytes, when it is not a whole reply
let rawReply: string | undefined;

beforeEach(async () => {
  home = mkdtempSync(join(tmpdir(), 'x-speak-admin-'));
  const dist = join(home, 'dist');
  const socket = join(home, 'control.sock');
  mkdirSync(join(dist, 'assets'), { recursive: true });
  mkdirSync(join(home, 'dist-secret'));
  writeFileSync(join(dist, 'index.html'), '<p>the page</p>');
  writeFileSync(join(dist, 'icon.png'), 'png');
  writeFileSync(join(home, 'dist-secret/index.html'), 'secret');
  writeFileSync(join(home, 'package.json'), 'secret');
  asked = [];
  replies = {};
  rawReply = undefined;
  fakeDaemon = createSocket((connection) => {
    connection.once('data', (sent) => {
      const line = JSON.parse(sent.toString());
      asked.push(line);
      connection.end(
        rawReply ?? `${JSON.stringify(replies[line.op] ?? { ok: true })}\n`,
      );
    });
  });
  await new Promise<void>((resolve) => fakeDaemon.listen(socket, resolve));
  admin = createServer(createAdmin({ canSave: true, dist, socket }));
  await new Promise<void>((resolve) => admin.listen(0, '127.0.0.1', resolve));
});

afterEach(async () => {
  await new Promise((resolve) => admin.close(resolve));
  await new Promise((resolve) => fakeDaemon.close(resolve));
  rmSync(home, { recursive: true });
});

describe('the write guard', () => {
  it.each([
    ['POST', '/api/stop', {}],
    ['POST', '/api/stop', { 'content-type': 'text/plain' }],
    [
      'POST',
      '/api/preview',
      { 'content-type': 'application/x-www-form-urlencoded' },
    ],
    ['PUT', '/api/config', { 'content-type': 'text/plain' }],
    ['PUT', '/api/favourites', {}],
    ['DELETE', '/api/config', {}],
  ])(
    '%s %s with %j answers 415 and reaches nothing',
    async (method, path, headers) => {
      const answer = await ask(
        method,
        path,
        headers,
        '{"engine":"kokoro","favourites":["x"]}',
      );

      expect(answer).toEqual({
        body: { error: 'send application/json' },
        status: 415,
        type: 'application/json',
      });
      expect(asked).toEqual([]);
    },
  );

  it.each([
    'application/json',
    'application/json; charset=utf-8',
    'application/jsonp',
  ])('a write as %s passes', async (type) => {
    const headers = { 'content-type': type };

    expect((await ask('POST', '/api/stop', headers)).status).toBe(200);
    expect(
      (await ask('PUT', '/api/config', headers, JSON.stringify(SETTINGS)))
        .status,
    ).toBe(200);
  });

  it('a GET needs no type', async () => {
    expect((await ask('GET', '/api/status')).status).toBe(200);
  });
});

describe('the host', () => {
  it.each(['127.0.0.1', '127.0.0.1:7386', 'localhost:7387', '[::1]:7386'])(
    '%s is this server',
    async (host) => {
      expect((await ask('GET', '/api/status', { host })).status).toBe(200);
    },
  );

  // another page's own name, pointed at this mac: the browser calls it same-origin, so no header stops it
  it.each([
    'evil.example',
    'evil.example:7386',
    'localhost.evil.example',
    '127.0.0.1.evil.example:7386',
  ])('«%s» reaches nothing', async (host) => {
    const answer = await ask('POST', '/api/stop', { ...JSON_TYPE, host });

    expect(answer.status).toBe(403);
    expect(asked).toEqual([]);
  });
});

describe('the page folder', () => {
  it('serves the page and a file by its type', async () => {
    expect(await ask('GET', '/')).toEqual({
      body: '<p>the page</p>',
      status: 200,
      type: 'text/html; charset=utf-8',
    });
    expect((await ask('GET', '/?v=2')).body).toBe('<p>the page</p>');
    expect(await ask('GET', '/icon.png?v=2')).toEqual({
      body: 'png',
      status: 200,
      type: 'image/png',
    });
  });

  it.each([
    '/../package.json',
    '/%2e%2e/package.json',
    '/..%2fpackage.json',
    '/assets/../../package.json',
    '/../dist-secret/index.html',
    '/missing.js',
    '/..',
  ])('%s is not found', async (path) => {
    expect(await ask('GET', path)).toEqual({
      body: { error: 'not found' },
      status: 404,
      type: 'application/json',
    });
  });

  it('a folder and a broken encoding are refused, not read', async () => {
    expect((await ask('GET', '/assets')).status).toBe(400);
    expect((await ask('GET', '/%')).status).toBe(400);
  });
});

describe('the routes over a daemon', () => {
  it.each([
    ['POST', '/api/pause', '', { op: 'pause' }],
    ['POST', '/api/stop', '', { op: 'stop' }],
    ['POST', '/api/wave', '{"on":true,"op":"stop"}', { on: true, op: 'wave' }],
    [
      'POST',
      '/api/preview',
      '{"engine":"kokoro","op":"stop","text":"hi"}',
      { engine: 'kokoro', op: 'preview', text: 'hi' },
    ],
  ])('%s %s asks the daemon', async (method, path, sent, want) => {
    const answer = await ask(method, path, JSON_TYPE, sent);

    expect(answer.body).toEqual({ ok: true });
    expect(asked).toEqual([want]);
  });

  it('status is the daemon’s own', async () => {
    replies.status = { speaking: true };

    expect((await ask('GET', '/api/status')).body).toEqual({ speaking: true });
  });

  it('voices carry the mac’s beside the engines’', async () => {
    replies.voices = { system: [{ id: 'mac' }] };

    const { body } = await ask('GET', '/api/voices');

    expect(body).toMatchObject({
      fish: [['933563129e564b19a115bedd57b7406a', 'Sarah']],
      system: [{ id: 'mac' }],
    });
  });

  it('config is the daemon’s, with its version', async () => {
    replies.config = { config: { firstAudioMs: 900 }, ok: true, version: 'v' };

    expect((await ask('GET', '/api/config')).body).toEqual(replies.config);
  });

  it('a save asks the daemon for the changed keys over their version', async () => {
    const answer = await ask(
      'PUT',
      '/api/config',
      JSON_TYPE,
      '{"patch":{"firstAudioMs":700},"version":"v"}',
    );

    expect(answer.body).toEqual({ ok: true });
    expect(asked).toEqual([
      { op: 'save', patch: { firstAudioMs: 700 }, version: 'v' },
    ]);
  });

  it('a heart asks for one voice', async () => {
    await ask(
      'PUT',
      '/api/favourites',
      JSON_TYPE,
      '{"engine":"kokoro","on":true,"voice":"af_sky"}',
    );

    expect(asked).toEqual([
      { engine: 'kokoro', on: true, op: 'heart', voice: 'af_sky' },
    ]);
  });

  it('a save cannot name another op', async () => {
    await ask('PUT', '/api/config', JSON_TYPE, '{"op":"block-main"}');

    expect(asked).toEqual([{ op: 'save' }]);
  });

  it.each([
    ['H1: a save the daemon refuses', '{"firstAudioMs":0}'],
    ['H1: an empty-body save', ''],
    ['H4: a save over settings that moved on', JSON.stringify(SETTINGS)],
  ])('%s says why', async (_, sent) => {
    replies.save = { error: 'refused' };

    const answer = await ask('PUT', '/api/config', JSON_TYPE, sent);

    expect(answer.body).toEqual({ error: 'refused' });
  });

  it.each([
    ['M19: cut short', '{"speaking":tr'],
    ['M19: empty', ''],
    ['M19: an empty object', '{}\n'],
    ['M19: not an object', '7\n'],
  ])('a reply %s is an error the server survives', async (_, line) => {
    rawReply = line;
    const error = { error: 'x-speak closed the line before it answered' };

    expect((await ask('GET', '/api/status')).body).toEqual(error);
    expect((await ask('PUT', '/api/config', JSON_TYPE, '{}')).body).toEqual(
      error,
    );
  });

  it('a letter split over two chunks arrives whole', async () => {
    const line = Buffer.from('{"error":"її"}\n');
    fakeDaemon.removeAllListeners('connection');
    fakeDaemon.on('connection', (connection) => {
      connection.once('data', () => {
        connection.write(line.subarray(0, 11));
        setTimeout(() => connection.end(line.subarray(11)), 20);
      });
    });

    expect((await ask('POST', '/api/stop', JSON_TYPE)).body).toEqual({
      error: 'її',
    });
  });

  it('M19: an answer that says neither ok nor error is no success', async () => {
    replies.save = { speaking: false };

    expect((await ask('PUT', '/api/config', JSON_TYPE, '{}')).body).toEqual({
      error: 'x-speak closed the line before it answered',
    });
  });

  it('a body that is not json is a 400', async () => {
    expect((await ask('POST', '/api/preview', JSON_TYPE, 'hi')).status).toBe(
      400,
    );
  });

  it.each(['/api/nothing', '/api/config?x=1'])(
    'GET %s is not found',
    async (path) => {
      expect((await ask('GET', path)).status).toBe(404);
    },
  );
});

describe('a worktree’s server', () => {
  it('plays but never saves', async () => {
    await new Promise((resolve) => admin.close(resolve));
    admin = createServer(
      createAdmin({
        canSave: false,
        dist: join(home, 'dist'),
        socket: join(home, 'control.sock'),
      }),
    );
    await new Promise<void>((resolve) => admin.listen(0, '127.0.0.1', resolve));

    const refused = {
      error:
        'a worktree never saves the live settings — start its server with a socket of its own',
    };
    expect((await ask('PUT', '/api/config', JSON_TYPE, '{}')).body).toEqual(
      refused,
    );
    expect((await ask('PUT', '/api/favourites', JSON_TYPE, '{}')).body).toEqual(
      refused,
    );
    expect(asked).toEqual([]);
    expect((await ask('POST', '/api/stop', JSON_TYPE)).body).toEqual({
      ok: true,
    });
  });

  it('given a link to the live socket never saves', () => {
    const app = join(home, 'repo/apps/speak');
    const state = join(home, '.local/share/x-speak');
    const own = join(home, 'own.sock');
    mkdirSync(app, { recursive: true });
    mkdirSync(state, { recursive: true });
    writeFileSync(join(home, 'repo/.git'), 'gitdir: x');
    writeFileSync(join(state, 'control.sock'), '');
    symlinkSync(join(state, 'control.sock'), own);

    expect(adminPaths({ app, home, own }).canSave).toBe(false);
  });

  it.each([
    ['the main checkout', 'folder', undefined, true],
    ['a worktree', 'file', undefined, false],
    ['a worktree with a socket of its own', 'file', '/tmp/own.sock', true],
    [
      'a worktree given the live socket',
      'file',
      '/h/.local/share/x-speak/control.sock',
      false,
    ],
    [
      'a worktree given the live socket in other words',
      'file',
      '/h/.local/share/../share/x-speak/control.sock',
      false,
    ],
    ['no repo at all', 'none', undefined, true],
  ])('%s: %s, socket %s → saves %s', (_, git, own, canSave) => {
    const app = join(home, 'repo/apps/speak');
    mkdirSync(app, { recursive: true });
    if (git === 'folder') mkdirSync(join(home, 'repo/.git'));
    if (git === 'file') writeFileSync(join(home, 'repo/.git'), 'gitdir: x');

    expect(adminPaths({ app, home: '/h', own })).toEqual({
      canSave,
      dist: join(app, 'dist'),
      socket: own ?? '/h/.local/share/x-speak/control.sock',
    });
  });
});

describe('the routes with no daemon', () => {
  beforeEach(async () => {
    await new Promise((resolve) => fakeDaemon.close(resolve));
  });
  afterEach(async () => {
    await new Promise<void>((resolve) =>
      fakeDaemon.listen(join(home, 'control.sock'), resolve),
    );
  });

  it('status says it is not reachable', async () => {
    const { body, status } = await ask('GET', '/api/status');

    expect(status).toBe(200);
    expect((body as { error: string }).error).toContain(
      'x-speak is not reachable — ',
    );
  });

  it('M3: a save says it is not reachable', async () => {
    const { body } = await ask('PUT', '/api/config', JSON_TYPE, '{}');

    expect((body as { error: string }).error).toContain('not reachable');
  });

  it('voices come without the mac’s', async () => {
    expect((await ask('GET', '/api/voices')).body).toMatchObject({
      system: [],
    });
  });
});

/* Helpers */
// node's own client sends a path as it is; fetch would resolve the dots first
function ask(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  sent = '',
) {
  return new Promise<Answer>((resolve, reject) => {
    const call = request(
      { headers, method, path, port: (admin.address() as AddressInfo).port },
      (response) => {
        let text = '';
        response.on('data', (chunk) => {
          text += chunk;
        });
        response.on('end', () => {
          const type = response.headers['content-type'];
          resolve({
            body: type === 'application/json' ? JSON.parse(text) : text,
            status: response.statusCode,
            type,
          });
        });
      },
    );
    call.on('error', reject);
    call.end(sent);
  });
}

/* Types */
interface Answer {
  body: unknown;
  status: number | undefined;
  type: string | undefined;
}
