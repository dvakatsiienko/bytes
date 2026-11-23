import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
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

import { createAdmin } from './admin.ts';

const LIVE = join(import.meta.dirname, 'daemon/config.json');
const SETTINGS = {
  chain: { en: ['kokoro'] },
  engines: { kokoro: { gain: 2 } },
  firstAudioMs: 900,
};
const JSON_TYPE = { 'content-type': 'application/json' };

let home: string;
let config: string;
let admin: Server;
let fakeDaemon: SocketServer;
let asked: unknown[];
let replies: Record<string, unknown>;

beforeEach(async () => {
  home = mkdtempSync(join(tmpdir(), 'x-speak-admin-'));
  config = join(home, 'config.json');
  const dist = join(home, 'dist');
  const socket = join(home, 'control.sock');
  writeFileSync(config, JSON.stringify(SETTINGS));
  mkdirSync(join(dist, 'assets'), { recursive: true });
  mkdirSync(join(home, 'dist-secret'));
  writeFileSync(join(dist, 'index.html'), '<p>the page</p>');
  writeFileSync(join(dist, 'icon.png'), 'png');
  writeFileSync(join(home, 'dist-secret/index.html'), 'secret');
  writeFileSync(join(home, 'package.json'), 'secret');
  asked = [];
  replies = {};
  fakeDaemon = createSocket((connection) => {
    connection.once('data', (sent) => {
      const line = JSON.parse(sent.toString());
      asked.push(line);
      connection.end(`${JSON.stringify(replies[line.op] ?? { ok: true })}\n`);
    });
  });
  await new Promise<void>((resolve) => fakeDaemon.listen(socket, resolve));
  admin = createServer(createAdmin({ config, dist, socket }));
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
      expect(readFileSync(config, 'utf8')).toBe(JSON.stringify(SETTINGS));
    },
  );

  it.each([
    'application/json',
    'application/json; charset=utf-8',
    'application/jsonp',
  ])('a POST as %s passes', async (type) => {
    expect(
      (await ask('POST', '/api/stop', { 'content-type': type })).status,
    ).toBe(200);
  });

  it('a GET needs no type', async () => {
    expect((await ask('GET', '/api/status')).status).toBe(200);
  });
});

describe('the page folder', () => {
  it('serves the page and a file by its type', async () => {
    expect(await ask('GET', '/')).toEqual({
      body: '<p>the page</p>',
      status: 200,
      type: 'text/html; charset=utf-8',
    });
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
      '{"engine":"kokoro","text":"hi"}',
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

  it('config is the settings file', async () => {
    expect((await ask('GET', '/api/config')).body).toEqual(SETTINGS);
  });

  it('a save writes the given settings, its keys sorted, and reloads the daemon', async () => {
    const answer = await ask(
      'PUT',
      '/api/config',
      JSON_TYPE,
      '{"firstAudioMs":700,"engines":{"kokoro":{"gain":2}},"chain":{"en":["kokoro"]}}',
    );

    expect(answer.body).toEqual({ ok: true });
    expect(asked).toEqual([{ op: 'reload' }]);
    expect(JSON.parse(readFileSync(config, 'utf8'))).toEqual({
      ...SETTINGS,
      firstAudioMs: 700,
    });
    expect(Object.keys(JSON.parse(readFileSync(config, 'utf8')))).toEqual([
      'chain',
      'engines',
      'firstAudioMs',
    ]);
  });

  it('a heart touches that engine’s favourites alone', async () => {
    await ask(
      'PUT',
      '/api/favourites',
      JSON_TYPE,
      '{"engine":"kokoro","favourites":["af_sky"]}',
    );

    expect(JSON.parse(readFileSync(config, 'utf8'))).toEqual({
      ...SETTINGS,
      engines: { kokoro: { favourites: ['af_sky'], gain: 2 } },
    });
  });

  it('a save and a heart leave the live settings file as it was', async () => {
    const before = readFileSync(LIVE);

    await ask(
      'PUT',
      '/api/config',
      JSON_TYPE,
      JSON.stringify({ ...SETTINGS, firstAudioMs: 1 }),
    );
    await ask(
      'PUT',
      '/api/favourites',
      JSON_TYPE,
      '{"engine":"kokoro","favourites":["af_sky"]}',
    );

    expect(readFileSync(LIVE).equals(before)).toBe(true);
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
