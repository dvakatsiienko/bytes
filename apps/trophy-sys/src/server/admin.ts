import { createHmac, timingSafeEqual } from 'node:crypto';

import type { Game } from '../shared/types.ts';
import { isNonGame } from '../shared/types.ts';
import { cached } from './cache.ts';
import { gamesFetch, sessionReset } from './psn.ts';
import {
  hiddenLoad,
  hiddenSave,
  npssoClear,
  npssoSave,
  shownLoad,
  shownSave,
} from './state.ts';

export const ADMIN_COOKIE = 'sys_admin';

/** 30 days, the cookie's Max-Age and the signed expiry both. */
const SESSION_MS = 2_592_000_000;

const NPSSO_LENGTH = 64;

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/;

interface AdminConfig {
  email: string;
  password: string;
  secret: string;
}

/**
 * Null is the only "unconfigured" answer, and every admin route turns it into a
 * 503. There is deliberately no fallback: a deploy missing one of these vars
 * must be shut, never open.
 */
export const adminConfig = (): AdminConfig | null => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;
  if (!(email && password && secret)) return null;

  return { email, password, secret };
};

/**
 * Both sides are hashed first so the compare is over two 32-byte buffers —
 * `timingSafeEqual` throws on a length mismatch, and the length of the secret
 * is itself something worth not leaking.
 */
const digest = (secret: string, value: string) =>
  createHmac('sha256', secret).update(value).digest();

const equals = (a: Buffer, b: Buffer) =>
  a.length === b.length && timingSafeEqual(a, b);

const sign = (secret: string, expiresAt: number) =>
  digest(secret, String(expiresAt)).toString('hex');

export const cookieRead = (header: string | undefined, name: string) =>
  header
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? null;

/**
 * `Secure` is dropped on localhost only — a browser refuses to store a secure
 * cookie over plain http, so keeping it always would make dev sign-in silently
 * fail. Everything else is fixed.
 */
const cookieSet = (value: string, maxAge: number, host: string) => {
  const local = LOCAL_HOST.test(host);

  return [
    `${ADMIN_COOKIE}=${value}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
    ...(local ? [] : ['Secure']),
  ].join('; ');
};

export const sessionCookie = (config: AdminConfig, host: string) => {
  const expiresAt = Date.now() + SESSION_MS;
  return cookieSet(
    `${expiresAt}.${sign(config.secret, expiresAt)}`,
    SESSION_MS / 1000,
    host,
  );
};

export const clearCookie = (host: string) => cookieSet('', 0, host);

export const sessionVerify = (
  config: AdminConfig,
  cookie: string | null,
): boolean => {
  const [rawExpiry, signature] = cookie?.split('.') ?? [];
  const expiresAt = Number(rawExpiry);
  if (!(signature && Number.isFinite(expiresAt)) || expiresAt <= Date.now())
    return false;

  return equals(
    Buffer.from(sign(config.secret, expiresAt), 'hex'),
    Buffer.from(signature, 'hex'),
  );
};

export const credentialsMatch = (
  config: AdminConfig,
  email: unknown,
  password: unknown,
) =>
  typeof email === 'string' &&
  typeof password === 'string' &&
  equals(
    digest(config.secret, config.email.toLowerCase()),
    digest(config.secret, email.trim().toLowerCase()),
  ) &&
  equals(
    digest(config.secret, config.password),
    digest(config.secret, password),
  );

/**
 * How many wrong passwords are free before the cooldown starts, and how long it
 * lasts: a flat minute. A doubling ladder used to live here, and it was the
 * mechanism by which a slow trickle of wrong guesses escalated the OWNER's own
 * wait — so failures reset when a window expires and every cooldown is equal.
 */
const LOGIN_FAILURE_LIMIT = 5;
const LOCKOUT_MS = 60_000;

/**
 * The login throttle's whole state. Exported as a factory rather than a reset
 * verb so a test can hold its own gate instead of reaching into the module's.
 */
export interface LoginGate {
  failures: number;
  lockedUntil: number;
}

export const loginGateCreate = (): LoginGate => ({
  failures: 0,
  lockedUntil: 0,
});

/**
 * One counter for the whole process, not one per IP: this deployment has
 * exactly one legitimate user, so a global count is the complete truth, while
 * an IP key is attacker-chosen — `x-forwarded-for` is a request header, so
 * per-IP buckets hand out a free quota reset per forged value.
 *
 * ⚠️ Best-effort, and deliberately so. On Vercel this lives in one warm
 * instance's memory: it does not survive a cold start and is not shared across
 * concurrent instances, so a spread-out burst can outrun it. The honest version
 * is a counter in the shared KV store, but `state.ts` exposes only fixed typed
 * keys, and a KV round-trip on every attempt costs more than the compare it is
 * guarding. What this buys is real but bounded — a guessing run against a warm
 * instance goes from free to minutes per five tries. It is not a distributed
 * rate limit, and should become one if `state.ts` ever grows a generic counter.
 */
const loginGate = loginGateCreate();

export type LoginResult =
  | { kind: 'locked'; retryAfterSeconds: number }
  | { kind: 'ok' }
  | { kind: 'rejected' };

const locked = (until: number, now: number): LoginResult => ({
  kind: 'locked',
  retryAfterSeconds: Math.ceil((until - now) / 1000),
});

/**
 * The whole login decision: compare first, then throttle.
 *
 * ⚠️ The order is the security property, not a style choice. Checking the
 * lockout first turned this console into a denial-of-service on its own owner:
 * a wrong password every few minutes kept the gate locked, the correct password
 * was refused while it was, and the NPSSO recovery page is exactly what a
 * locked-out owner needs. A correct password is not a guess, so it is always
 * honoured — an attacker holding it has already won, and throttling them buys
 * nothing. What the cooldown throttles is guessing, which is all it ever did.
 */
export const loginAttempt = (
  config: AdminConfig,
  email: unknown,
  password: unknown,
  gate: LoginGate = loginGate,
): LoginResult => {
  const now = Date.now();

  if (credentialsMatch(config, email, password)) {
    gate.failures = 0;
    gate.lockedUntil = 0;
    return { kind: 'ok' };
  }

  // An expired cooldown ends the window it belonged to. The cooldown is a flat
  // minute rather than a doubling ladder: carrying failures across windows was
  // what let a slow trickle of wrong passwords escalate the owner's own wait
  // without bound, and resetting the count leaves the ladder unreachable.
  if (gate.lockedUntil && gate.lockedUntil <= now) {
    gate.failures = 0;
    gate.lockedUntil = 0;
  }

  // Already locked: refuse without counting, so hammering cannot extend it.
  if (gate.lockedUntil > now) return locked(gate.lockedUntil, now);

  gate.failures += 1;
  if (gate.failures < LOGIN_FAILURE_LIMIT) return { kind: 'rejected' };

  // Answered on the failure that trips it, not the one after — being told to
  // wait is more use than a sixth "bad credentials".
  gate.lockedUntil = now + LOCKOUT_MS;
  return locked(gate.lockedUntil, now);
};

const stringList = (value: unknown): string[] | null =>
  Array.isArray(value) && value.every((id) => typeof id === 'string')
    ? [...new Set(value)]
    : null;

/** The body carries the complete new set — a replace, never a merge. */
/**
 * Whether a title is hidden right now. Both stores hold only *deviations* from
 * the auto-hide rule — `hidden` the ids it would show, `shown` the ids it would
 * hide — so a soundtrack bought tomorrow is hidden with nothing written for it,
 * and a title unhidden today stays unhidden through every later sync.
 */
const hiddenIs = (game: Game, hidden: Set<string>, shown: Set<string>) =>
  isNonGame(game.name) ? !shown.has(game.id) : hidden.has(game.id);

/**
 * The body says what to do — hide or show these ids — rather than carrying a
 * finished set. With a rule in play a set no longer expresses intent: leaving a
 * rule-hidden id out of it is indistinguishable from asking to show it.
 */
export const hiddenFlip = async (
  rawIds: unknown,
  hide: unknown,
  limit: number,
) => {
  const ids = stringList(rawIds);
  if (!ids || typeof hide !== 'boolean') return null;

  const [games, hidden, shown] = await Promise.all([
    cached(`games:raw:${limit}`, () => gamesFetch(limit)),
    hiddenLoad(),
    shownLoad(),
  ]);

  const ruled = new Set(
    games.filter((game) => isNonGame(game.name)).map((game) => game.id),
  );
  const nextHidden = new Set(hidden);
  const nextShown = new Set(shown);

  for (const id of ids) {
    // Each id is recorded in exactly one list: the one that holds deviations
    // for its kind. Writing to both would let them contradict each other.
    if (ruled.has(id)) {
      if (hide) nextShown.delete(id);
      else nextShown.add(id);
    } else if (hide) nextHidden.add(id);
    else nextHidden.delete(id);
  }

  await Promise.all([hiddenSave([...nextHidden]), shownSave([...nextShown])]);

  return { hidden: [...nextHidden], shown: [...nextShown] };
};

/**
 * PSN's NPSSO is a fixed 64-char token. Storing a shorter paste would only
 * surface as an auth failure on the next PSN call, long after the page said ok.
 */
export const npssoSet = async (value: unknown) => {
  if (typeof value !== 'string' || value.trim().length !== NPSSO_LENGTH)
    return false;

  await npssoSave(value.trim());
  // The in-memory PSN session was minted from the old token; keeping it would
  // hide whether the new one works until the access token expires.
  sessionReset();
  return true;
};

/**
 * Hands the app back to the `NPSSO` env var by forgetting the pasted token —
 * the only way to make Vercel the source again, since the store always wins.
 * The session goes with it, or the next call would still ride the old token.
 */
export const npssoDrop = async () => {
  await npssoClear();
  sessionReset();
};

/**
 * `all` is what the admin screen reads: every game, each flagged. The default
 * is the public library with the hidden ones gone.
 */
export const gamesView = async (limit: number, all: boolean) => {
  const [games, hidden, shown] = await Promise.all([
    // The unfiltered library, shared with `gameDetailFetch` so a deep link to a
    // hidden game still resolves from the same fetch.
    cached(`games:raw:${limit}`, () => gamesFetch(limit)),
    hiddenLoad(),
    shownLoad(),
  ]);
  const hiddenIds = new Set(hidden);
  const shownIds = new Set(shown);

  return all
    ? games.map(
        (game): Game => ({
          ...game,
          hidden: hiddenIs(game, hiddenIds, shownIds),
        }),
      )
    : games.filter((game) => !hiddenIs(game, hiddenIds, shownIds));
};
