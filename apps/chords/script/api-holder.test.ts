import { type RequestListener, createServer } from 'node:http';
import { type Server, createServer as createTcpServer } from 'node:net';
import { afterEach, expect, it } from 'vitest';

import { apiHolder } from './api-holder.ts';

let server: Server | undefined;

afterEach(() => {
  server?.close();
});

const listen = (next: Server) => {
  server = next;

  return new Promise<number>((done) => {
    next.listen(0, '127.0.0.1', () => {
      const address = next.address();

      done(typeof address === 'object' && address ? address.port : 0);
    });
  });
};

const answering = (status: number, body: string) => {
  const handler: RequestListener = (_request, response) => {
    response.writeHead(status);
    response.end(body);
  };

  return listen(createServer(handler));
};

it('is none on a port that refuses', async () => {
  const port = await answering(200, '');
  await new Promise((done) => server?.close(done));

  expect(await apiHolder(port)).toBe('none');
});

it('is the daemon on a bindings answer', async () => {
  const body = '{"hotkeys":[],"modifierOrder":[]}';

  expect(await apiHolder(await answering(200, body))).toBe('daemon');
});

it('is an outdated daemon when the answer lacks the modifier order', async () => {
  expect(await apiHolder(await answering(200, '{"hotkeys":[]}'))).toBe(
    'outdated',
  );
});

it('is the daemon before its first scan', async () => {
  const body = '{"error":"no scan yet — run pnpm hotkeys:scan"}';

  expect(await apiHolder(await answering(503, body))).toBe('daemon');
});

it.each([
  ['a page', 200, '<!doctype html>'],
  ['foreign json', 200, '{"ok":true}'],
  ['another 503', 503, '{"error":"busy"}'],
])('is another server on %s', async (_what, status, body) => {
  expect(await apiHolder(await answering(status, body))).toBe('other');
});

it('is another server on a socket that hangs up without answering', async () => {
  const port = await listen(createTcpServer((socket) => socket.destroy()));

  expect(await apiHolder(port)).toBe('other');
});
