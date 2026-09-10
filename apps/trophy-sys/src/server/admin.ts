import { createHmac, timingSafeEqual } from 'node:crypto';

import type { Game } from '../shared/types.ts';
import { cached } from './cache.ts';
import { gamesFetch, sessionReset } from './psn.ts';
import { hiddenLoad, hiddenSave, npssoSave } from './state.ts';

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
 * How many wrong passwords are free before the cooldown starts, and the shape
 * of that cooldown: one minute, doubling per further failure, capped so the
 * owner is never more than a coffee away from another try.
 */
const LOGIN_FAILURE_LIMIT = 5;
const LOCKOUT_BASE_MS = 60_000;
const LOCKOUT_MAX_MS = 900_000;

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

const lockoutMs = (failures: number) =>
  Math.min(
    LOCKOUT_BASE_MS * 2 ** (failures - LOGIN_FAILURE_LIMIT),
    LOCKOUT_MAX_MS,
  );

export type LoginResult =
  | { kind: 'locked'; retryAfterSeconds: number }
  | { kind: 'ok' }
  | { kind: 'rejected' };

const locked = (until: number, now: number): LoginResult => ({
  kind: 'locked',
  retryAfterSeconds: Math.ceil((until - now) / 1000),
});

/**
 * The whole login decision: throttle, compare, and the bookkeeping either
 * answer implies. `lockedUntil` is always a moment in the future rather than a
 * flag, so every lockout expires on its own and the owner can never be shut out
 * permanently by an attacker's traffic.
 */
export const loginAttempt = (
  config: AdminConfig,
  email: unknown,
  password: unknown,
  gate: LoginGate = loginGate,
): LoginResult => {
  const now = Date.now();
  if (gate.lockedUntil > now) return locked(gate.lockedUntil, now);

  if (!credentialsMatch(config, email, password)) {
    gate.failures += 1;
    if (gate.failures < LOGIN_FAILURE_LIMIT) return { kind: 'rejected' };

    // Answered on the failure that trips it, not the one after — being told to
    // wait is more use than a sixth "bad credentials".
    gate.lockedUntil = now + lockoutMs(gate.failures);
    return locked(gate.lockedUntil, now);
  }

  // The owner arrived; the cooldown has done its job and starts over.
  gate.failures = 0;
  gate.lockedUntil = 0;
  return { kind: 'ok' };
};

const stringList = (value: unknown): string[] | null =>
  Array.isArray(value) && value.every((id) => typeof id === 'string')
    ? [...new Set(value)]
    : null;

/** The body carries the complete new set — a replace, never a merge. */
export const hiddenSet = async (value: unknown) => {
  const ids = stringList(value);
  if (!ids) return null;

  await hiddenSave(ids);
  return ids;
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
 * `all` is what the admin screen reads: every game, each flagged. The default
 * is the public library with the hidden ones gone.
 */
export const gamesView = async (limit: number, all: boolean) => {
  const [games, hidden] = await Promise.all([
    // The unfiltered library, shared with `gameDetailFetch` so a deep link to a
    // hidden game still resolves from the same fetch.
    cached(`games:raw:${limit}`, () => gamesFetch(limit)),
    hiddenLoad(),
  ]);
  const hiddenIds = new Set(hidden);

  return all
    ? games.map((game): Game => ({ ...game, hidden: hiddenIds.has(game.id) }))
    : games.filter((game) => !hiddenIds.has(game.id));
};
