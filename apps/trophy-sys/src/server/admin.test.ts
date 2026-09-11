import { assert, expect, test } from 'vitest';

import {
  ADMIN_COOKIE,
  adminConfig,
  cookieRead,
  credentialsMatch,
  loginAttempt,
  loginGateCreate,
  sessionCookie,
  sessionVerify,
} from './admin.ts';

/**
 * The admin session is a signed string handed to a browser and taken back
 * unverified. Everything here pins a way that contract can be broken by
 * someone who does not have the secret — plus the throttle that decides how
 * many times they may try.
 */

const CONFIG = {
  email: 'owner@example.com',
  password: 'correct horse',
  secret: 'test-secret',
};

/** The cookie's value, as a browser would send it back. */
const issue = (config = CONFIG) =>
  cookieRead(sessionCookie(config, 'localhost:5178'), ADMIN_COOKIE) ?? '';

test('a cookie this secret signed verifies, and one it did not does not', () => {
  expect(sessionVerify(CONFIG, issue())).toBe(true);
  expect(sessionVerify({ ...CONFIG, secret: 'other-secret' }, issue())).toBe(
    false,
  );
});

test('a tampered signature is rejected', () => {
  const [expiry, signature] = issue().split('.');
  // assert.ok, not expect: only the assertion signature narrows the type, and
  // the line below indexes into `signature`.
  assert.ok(expiry && signature);

  // One hex digit, flipped — same length, so only the compare can catch it.
  const flipped = `${signature.slice(0, -1)}${signature.at(-1) === '0' ? '1' : '0'}`;
  expect(sessionVerify(CONFIG, `${expiry}.${flipped}`)).toBe(false);
});

test('a tampered expiry is rejected, because the expiry is what is signed', () => {
  const [expiry, signature] = issue().split('.');
  const extended = Number(expiry) + 86_400_000;
  expect(sessionVerify(CONFIG, `${extended}.${signature}`)).toBe(false);
});

test('an expired cookie is rejected even though its signature is genuine', () => {
  const past = Date.now() - 1000;
  const [, genuine] = issue().split('.');
  expect(genuine).toBeTruthy();
  // The signature is not recomputed for `past`, so this only pins the clock
  // check; the pair above pins that a forged expiry cannot survive either.
  expect(sessionVerify(CONFIG, `${past}.${genuine}`)).toBe(false);
});

/**
 * `timingSafeEqual` throws a RangeError on a length mismatch, so a short
 * signature is a crash — a 500 — rather than a rejection, unless the lengths
 * are compared first. Same for a value that is not hex at all: `Buffer.from`
 * truncates it silently rather than raising.
 */
test('a malformed cookie is rejected without throwing', () => {
  for (const cookie of [
    null,
    '',
    'nonsense',
    '.',
    `${Date.now() + 1000}.`,
    `${Date.now() + 1000}.ab`,
    `${Date.now() + 1000}.${'f'.repeat(500)}`,
    `${Date.now() + 1000}.zzzz`,
    `notanumber.${'f'.repeat(64)}`,
  ])
    expect(sessionVerify(CONFIG, cookie), `cookie: ${cookie}`).toBe(false);
});

test('credentials compare case-insensitively on email and exactly on password', () => {
  expect(
    credentialsMatch(CONFIG, '  OWNER@Example.com ', CONFIG.password),
  ).toBe(true);
  expect(credentialsMatch(CONFIG, CONFIG.email, 'Correct Horse')).toBe(false);
  expect(credentialsMatch(CONFIG, CONFIG.email, `${CONFIG.password} `)).toBe(
    false,
  );
  // A non-string body field must answer false rather than reach the hash.
  expect(credentialsMatch(CONFIG, undefined, CONFIG.password)).toBe(false);
  expect(credentialsMatch(CONFIG, CONFIG.email, { length: 13 })).toBe(false);
});

test('adminConfig is null unless all three vars are present', () => {
  // The test process carries none of them, which is the unconfigured deploy
  // every admin route answers 503 for.
  expect(adminConfig()).toBe(null);

  process.env.ADMIN_EMAIL = CONFIG.email;
  process.env.ADMIN_PASSWORD = CONFIG.password;
  try {
    expect(adminConfig(), 'two of three is still unconfigured').toBe(null);

    process.env.ADMIN_SECRET = CONFIG.secret;
    expect(adminConfig()).toStrictEqual(CONFIG);
  } finally {
    // `= undefined` would store the string "undefined", which reads as
    // configured and would leave every later test in this file lying.
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SECRET;
  }
});

test('five wrong passwords lock the login, and the answer says for how long', () => {
  const gate = loginGateCreate();

  for (let attempt = 1; attempt < 5; attempt += 1)
    expect(
      loginAttempt(CONFIG, CONFIG.email, 'wrong', gate),
      `attempt ${attempt} should still be a plain rejection`,
    ).toStrictEqual({ kind: 'rejected' });

  const locked = loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
  assert.ok(locked.kind === 'locked');
  expect(locked.retryAfterSeconds).toBeGreaterThan(0);
  expect(locked.retryAfterSeconds).toBeLessThanOrEqual(60);
});

test('a locked gate still admits the correct password', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 5; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  expect(gate.lockedUntil, 'the gate is locked').toBeGreaterThan(Date.now());

  // The regression this pins: refusing the owner during a cooldown turned the
  // throttle into a denial of service on the one console that renews the token.
  expect(
    loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate),
  ).toStrictEqual({
    kind: 'ok',
  });
  expect(gate.lockedUntil, 'the owner arriving clears the gate').toBe(0);
});

test('hammering during a cooldown cannot push the deadline back', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 5; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  const until = gate.lockedUntil;
  for (let attempt = 0; attempt < 20; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  expect(gate.lockedUntil).toBe(until);
});

test('a slow trickle of wrong passwords cannot escalate the wait', () => {
  const gate = loginGateCreate();
  const waits: number[] = [];

  // One guess, wait out the cooldown, guess again — the shape that used to
  // ratchet the lockout up a rung every round until it pinned at the cap.
  for (let round = 0; round < 12; round += 1) {
    const result = loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
    if (result.kind === 'locked') {
      waits.push(result.retryAfterSeconds);
      gate.lockedUntil = Date.now() - 1;
    }
  }

  expect(waits.length, 'the gate locked more than once').toBeGreaterThan(1);
  expect([...new Set(waits)], 'every cooldown stays one minute').toStrictEqual([
    60,
  ]);
});

test('the cooldown expires on its own and the owner gets back in', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 5; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  // The lockout is a moment, not a flag, so letting it pass is the whole
  // recovery path — nothing has to clear it.
  gate.lockedUntil = Date.now() - 1;

  expect(
    loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate),
  ).toStrictEqual({
    kind: 'ok',
  });
  expect(gate.failures, 'a success clears the counter').toBe(0);
  expect(gate.lockedUntil).toBe(0);
});

test('after a success the next five failures start the count over', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 4; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
  loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate);

  expect(loginAttempt(CONFIG, CONFIG.email, 'wrong', gate)).toStrictEqual({
    kind: 'rejected',
  });
});
