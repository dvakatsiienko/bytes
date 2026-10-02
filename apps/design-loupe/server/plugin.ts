import { existsSync, watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { z } from 'zod';

import { readBuild, readOthers } from './build.ts';
import {
  InputError,
  boardsDirOf,
  readAsks,
  readJob,
  reopenAsk,
  sendToDesigner,
  writeAnswer,
} from './job.ts';
import type { FSWatcher } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * design-loupe's local api on the vite dev server:
 *
 *   GET  /api/job              the job: boards, asks, answers, states
 *   POST /api/answer           {id, pick, text} — dima's answer
 *   POST /api/reopen           {id} — drops the answer
 *   POST /api/send             {} — «send to designer»: hands the round's answers to the designer
 *   GET  /boards/<file>        a board file, its assets, and `support.js` (the runtime)
 *
 * A change to any job file is pushed to the page as the `loupe:job` hmr event.
 * Trust: the job dir comes from the server's own env, never a request; a board
 * path from a request is resolved and must stay inside the boards folder.
 */
export const loupeApi = (options: LoupeOptions): Plugin => ({
  configureServer(server) {
    const { jobDir } = options;
    server.middlewares.use('/api', (req, res) => {
      if (!isTrustedRequest(req)) {
        send(res, 403, { error: 'writes come from the loupe page, as json' });
        return;
      }
      routeApi(jobDir, req, res).catch((error: unknown) => {
        send(res, error instanceof InputError ? 400 : 500, {
          error: errorText(error),
        });
      });
    });
    server.middlewares.use('/boards', (req, res) => {
      serveBoard(jobDir, options.runtime, req, res).catch((error: unknown) => {
        send(res, 500, { error: errorText(error) });
      });
    });
    watchJob(server, jobDir);
  },
  name: 'design-loupe-api',
});

/**
 * Any web page can send a request to localhost. A browser always sends Origin
 * on a cross-site write, so only this server's own page (or a tool with no
 * Origin) gets through; requiring json on top closes the no-Origin form posts.
 */
export const isTrustedRequest = (
  req: Pick<IncomingMessage, 'headers' | 'method'>,
) => {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  const { origin, host } = req.headers;
  if (origin !== undefined && origin !== `http://${host}`) return false;
  return (req.headers['content-type'] ?? '').startsWith('application/json');
};

/** a request path inside the boards folder, or null for anything that climbs out */
export const boardPath = (boardsDir: string, urlPath: string) => {
  const file = resolve(boardsDir, `.${decodeURIComponent(urlPath)}`);
  return file.startsWith(`${boardsDir}${sep}`) ? file : null;
};

/** the canvas runtime lives beside the app, out of git: one copy serves every board */
export const runtimeOf = (appDir: string) =>
  join(appDir, '.runtime/dc-runtime.js');

/* Helpers */

const answerBody = z.object({
  id: z.string(),
  note: z.string().max(2000),
  pick: z.number().int().nonnegative().nullable(),
});
const reopenBody = z.object({ id: z.string() });

const routeApi = async (
  jobDir: string,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const path = new URL(req.url ?? '/', 'http://loupe').pathname;
  if (req.method === 'GET' && path === '/build') {
    send(res, 200, await readBuild());
    return;
  }
  // apart from /api/build, which answers for itself only: two servers probing each other's probe would never end
  if (req.method === 'GET' && path === '/loupes') {
    send(res, 200, await readOthers());
    return;
  }
  if (req.method === 'GET' && path === '/job') {
    send(res, 200, await readJob(jobDir));
    return;
  }
  if (req.method === 'POST' && path === '/answer') {
    const body = answerBody.safeParse(await readBody(req));
    if (!body.success) throw new InputError('an answer is {id, pick, note}');
    await writeAnswer(jobDir, body.data);
    send(res, 200, { ok: true });
    return;
  }
  if (req.method === 'POST' && path === '/send') {
    await sendToDesigner(jobDir);
    send(res, 200, { ok: true });
    return;
  }
  if (req.method === 'POST' && path === '/reopen') {
    const body = reopenBody.safeParse(await readBody(req));
    if (!body.success) throw new InputError('a reopen is {id}');
    await reopenAsk(jobDir, body.data.id);
    send(res, 200, { ok: true });
    return;
  }
  send(res, 404, { error: `no ${req.method} ${path}` });
};

const types: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const serveBoard = async (
  jobDir: string,
  runtime: string,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const path = new URL(req.url ?? '/', 'http://loupe').pathname;
  // every board loads the canvas runtime as ./support.js
  if (path === '/support.js') {
    if (!existsSync(runtime)) {
      send(res, 404, {
        error: `no runtime at ${runtime} — AGENTS.md: the runtime`,
      });
      return;
    }
    res.writeHead(200, { 'content-type': types['.js'] });
    res.end(await readFile(runtime));
    return;
  }
  const file = boardPath(boardsDirOf(jobDir, await readAsks(jobDir)), path);
  if (!(file && existsSync(file))) {
    send(res, 404, { error: `no board file ${path}` });
    return;
  }
  res.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': types[extname(file)] ?? 'application/octet-stream',
  });
  res.end(await readFile(file));
};

/**
 * Node's own watch, not vite's: vite answers a changed `.html` with a full page
 * reload, and a board is html. Watches the job folder and the boards folder;
 * a burst of writes (a rename, a regenerated take) sends one event.
 */
const watchJob = (server: ViteDevServer, jobDir: string) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const announce = () => {
    clearTimeout(timer);
    timer = setTimeout(
      () => server.ws.send({ event: 'loupe:job', type: 'custom' }),
      80,
    );
  };
  // the boards folder comes from asks.json, so a new round can move it: re-read on every asks.json change
  let boards: { dir: string; handle: FSWatcher } | undefined;
  const followBoards = async () => {
    const dir = await readAsks(jobDir)
      .then((asks) => boardsDirOf(jobDir, asks))
      .catch(() => undefined);
    if (dir === boards?.dir) return;
    boards?.handle.close();
    boards =
      dir && relative(jobDir, dir) !== '' && existsSync(dir)
        ? { dir, handle: watch(dir, announce) }
        : undefined;
  };
  const job = existsSync(jobDir)
    ? watch(jobDir, (_event, file) => {
        announce();
        if (file === 'asks.json') followBoards();
      })
    : undefined;
  followBoards();
  server.httpServer?.on('close', () => {
    job?.close();
    boards?.handle.close();
  });
};

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    throw new InputError('the body is not json', { cause: error });
  }
};

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': types['.json'] });
  res.end(JSON.stringify(body));
};

const errorText = (error: unknown) => {
  if (error instanceof z.ZodError)
    return error.issues
      .map((issue) => `${issue.path.join('.') || 'file'}: ${issue.message}`)
      .join('; ');
  return error instanceof Error ? error.message : String(error);
};

/* Types */

interface LoupeOptions {
  /** the job folder: asks.json, answers.json */
  jobDir: string;
  /** the canvas runtime every board loads as ./support.js */
  runtime: string;
}
