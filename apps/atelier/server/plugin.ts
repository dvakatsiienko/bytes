import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';

import type * as piecesModule from '../art/pieces.ts';
import { isTime } from '../art/time.ts';
import { errorText } from '../src/error-text.ts';
import type * as settingsModule from '../src/stage/settings.ts';
import { bake, closeBrowser } from './bake.ts';
import { readBuild, readOthers } from './build.ts';
import type { Stash, Take, TakePatch } from './takes.ts';
import {
  TAKE_FILES,
  listTakes,
  promoteTake,
  resolveTakeId,
  saveTake,
  takeFile,
  updateTake,
} from './takes.ts';
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http';

/**
 * The studio's local api, mounted on the vite dev server under `/api`. It
 * trusts nothing it is sent: a piece id must be in the registry, a take id must
 * name a folder that exists, a file must be one of the take's own names —
 * nothing in a request is ever joined into a path unchecked.
 */
export const atelierApi = (): Plugin => ({
  configureServer(server) {
    server.httpServer?.on('close', closeBrowser);
    server.middlewares.use('/api', (req, res) => {
      if (!isTrustedRequest(req)) {
        send(res, 403, { error: 'writes come from the studio page, as json' });
        return;
      }
      route(server, req, res).catch((error: unknown) => {
        send(res, 500, {
          error: errorText(error),
        });
      });
    });
  },
  name: 'atelier-api',
});

/**
 * Any web page can send a request to localhost. The Origin check is the
 * guard: a browser always sends Origin on a cross-site write, and only this
 * server's own page (or a tool with no Origin at all) gets through. Requiring
 * json on top closes the no-Origin form posts. Vite's cors does answer a
 * preflight, so the preflight is not what stops a foreign page.
 */
export const isTrustedRequest = (req: {
  method?: string;
  headers: IncomingHttpHeaders;
}) => {
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  const { origin, host } = req.headers;
  if (origin !== undefined && origin !== `http://${host}`) return false;
  return (req.headers['content-type'] ?? '').startsWith('application/json');
};

const route = async (
  server: ViteDevServer,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  // loaded per request, so a piece added a minute ago is known without a restart
  const { findPiece } = (await server.ssrLoadModule(
    '/art/pieces.ts',
  )) as typeof piecesModule;
  const { toSettings } = (await server.ssrLoadModule(
    '/src/stage/settings.ts',
  )) as typeof settingsModule;
  const url = new URL(req.url ?? '/', 'http://atelier');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

  if (req.method === 'GET' && parts[0] === 'build' && parts.length === 1)
    return send(res, 200, await readBuild());
  // separate from /api/build, which answers for itself only: two servers probing each other's probe would never end
  if (req.method === 'GET' && parts[0] === 'ateliers' && parts.length === 1)
    return send(res, 200, await readOthers());

  if (req.method === 'POST' && parts[0] === 'bake' && parts.length === 1) {
    const body = await readBody(req);
    const piece =
      typeof body.piece === 'string' ? findPiece(body.piece) : undefined;
    if (!piece) return send(res, 400, { error: 'unknown piece' });
    if (!isTime(body.time))
      return send(res, 400, { error: 'time is day or night' });
    const settings = toSettings(body.settings);
    const frames = loopFrames(body.frames);
    const origin = server.resolvedUrls?.local[0];
    if (!origin)
      return send(res, 500, { error: 'the dev server has no local url' });
    const note = typeof body.note === 'string' ? body.note.slice(0, 200) : '';
    // a bake runs for seconds: the answer is one json line per step, the take (or the error) last
    res.statusCode = 200;
    res.setHeader('content-type', 'application/x-ndjson');
    res.setHeader('cache-control', 'no-cache');
    const line = (event: BakeEvent) => res.write(`${JSON.stringify(event)}\n`);
    try {
      const baked = await bake({
        frames,
        load: (path) => server.ssrLoadModule(path),
        onStep: (step) => line({ step }),
        origin,
        piece: piece.id,
        settings,
        time: body.time,
      });
      line({ step: 'saving the take' });
      const take = await saveTake({
        frames,
        note,
        piece: piece.id,
        settings,
        time: body.time,
        ...baked,
      });
      line({ take });
    } catch (error) {
      line({ error: errorText(error) });
    }
    res.end();
    return;
  }

  const [area, piece, takeId, file] = parts;
  if (area !== 'takes' || !piece || !findPiece(piece))
    return send(res, 404, { error: 'not found' });

  if (parts.length === 2 && req.method === 'GET')
    return send(res, 200, await listTakes(piece));

  const id = takeId ? await resolveTakeId(piece, takeId) : null;
  if (!id) return send(res, 404, { error: 'no such take' });

  if (parts.length === 3 && req.method === 'PATCH') {
    return send(
      res,
      200,
      await updateTake(piece, id, toPatch(await readBody(req))),
    );
  }
  if (parts.length === 4 && file === 'promote' && req.method === 'POST') {
    await promoteTake(piece, id);
    return send(res, 200, await listTakes(piece));
  }
  if (parts.length === 4 && req.method === 'GET') {
    // avif is made on request from the webp: a download format, never stored
    if (file === 'bake.avif') {
      const avif = await sharp(await readFile(takeFile(piece, id, 'bake.webp')))
        .avif({ quality: 70 })
        .toBuffer();
      return sendFile(res, avif, 'image/avif', `${piece}-${id}.avif`);
    }
    const takeFileName = TAKE_FILES.find((name) => name === file);
    if (takeFileName) {
      const type =
        takeFileName === 'piece.svg' ? 'image/svg+xml' : 'image/webp';
      // a lit take has no piece.svg: that is a missing file, not a server error
      const data = await readFile(takeFile(piece, id, takeFileName)).catch(
        () => null,
      );
      if (!data)
        return send(res, 404, { error: `take ${id} has no ${takeFileName}` });
      return sendFile(res, data, type);
    }
  }
  return send(res, 404, { error: 'not found' });
};

/** one line of a bake's answer: a step while it runs, then the take or the error */
export type BakeEvent = { step: string } | { take: Take } | { error: string };

/** a loop is 2–240 frames; anything else bakes a still */
const loopFrames = (value: unknown) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 2 &&
  value <= 240
    ? value
    : 1;

const toPatch = (body: Record<string, unknown>): TakePatch => {
  const patch: TakePatch = {};
  if (typeof body.note === 'string') patch.note = body.note.slice(0, 200);
  if (body.stash === null) patch.stash = null;
  else if (isStash(body.stash))
    patch.stash = {
      good: body.stash.good.slice(0, 400),
      notYet: body.stash.notYet.slice(0, 400),
    };
  return patch;
};

const isStash = (value: unknown): value is Stash =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).good === 'string' &&
  typeof (value as Record<string, unknown>).notYet === 'string';

const readBody = async (
  req: IncomingMessage,
): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    const parsed: unknown = JSON.parse(
      Buffer.concat(chunks).toString('utf8') || '{}',
    );
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
};

const sendFile = (
  res: ServerResponse,
  data: Buffer,
  type: string,
  downloadName?: string,
) => {
  res.statusCode = 200;
  res.setHeader('content-type', type);
  res.setHeader('cache-control', 'no-cache');
  if (downloadName)
    res.setHeader(
      'content-disposition',
      `attachment; filename="${downloadName}"`,
    );
  res.end(data);
};
