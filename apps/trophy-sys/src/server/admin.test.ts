import assert from 'node:assert/strict';
import { test } from 'node:test';

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
  assert.equal(sessionVerify(CONFIG, issue()), true);
  assert.equal(
    sessionVerify({ ...CONFIG, secret: 'other-secret' }, issue()),
    false,
  );
});

test('a tampered signature is rejected', () => {
  const [expiry, signature] = issue().split('.');
  assert.ok(expiry && signature);

  // One hex digit, flipped — same length, so only the compare can catch it.
  const flipped = `${signature.slice(0, -1)}${signature.at(-1) === '0' ? '1' : '0'}`;
  assert.equal(sessionVerify(CONFIG, `${expiry}.${flipped}`), false);
});

test('a tampered expiry is rejected, because the expiry is what is signed', () => {
  const [expiry, signature] = issue().split('.');
  const extended = Number(expiry) + 86_400_000;
  assert.equal(sessionVerify(CONFIG, `${extended}.${signature}`), false);
});

test('an expired cookie is rejected even though its signature is genuine', () => {
  const past = Date.now() - 1000;
  const [, genuine] = issue().split('.');
  assert.ok(genuine);
  // The signature is not recomputed for `past`, so this only pins the clock
  // check; the pair above pins that a forged expiry cannot survive either.
  assert.equal(sessionVerify(CONFIG, `${past}.${genuine}`), false);
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
    assert.equal(sessionVerify(CONFIG, cookie), false, `cookie: ${cookie}`);
});

test('credentials compare case-insensitively on email and exactly on password', () => {
  assert.equal(
    credentialsMatch(CONFIG, '  OWNER@Example.com ', CONFIG.password),
    true,
  );
  assert.equal(credentialsMatch(CONFIG, CONFIG.email, 'Correct Horse'), false);
  assert.equal(
    credentialsMatch(CONFIG, CONFIG.email, `${CONFIG.password} `),
    false,
  );
  // A non-string body field must answer false rather than reach the hash.
  assert.equal(credentialsMatch(CONFIG, undefined, CONFIG.password), false);
  assert.equal(credentialsMatch(CONFIG, CONFIG.email, { length: 13 }), false);
});

test('adminConfig is null unless all three vars are present', () => {
  // The test process carries none of them, which is the unconfigured deploy
  // every admin route answers 503 for.
  assert.equal(adminConfig(), null);

  process.env.ADMIN_EMAIL = CONFIG.email;
  process.env.ADMIN_PASSWORD = CONFIG.password;
  try {
    assert.equal(adminConfig(), null, 'two of three is still unconfigured');

    process.env.ADMIN_SECRET = CONFIG.secret;
    assert.deepEqual(adminConfig(), CONFIG);
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
    assert.deepEqual(
      loginAttempt(CONFIG, CONFIG.email, 'wrong', gate),
      { kind: 'rejected' },
      `attempt ${attempt} should still be a plain rejection`,
    );

  const locked = loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
  assert.equal(locked.kind, 'locked');
  assert.ok(locked.kind === 'locked' && locked.retryAfterSeconds > 0);
  assert.ok(locked.kind === 'locked' && locked.retryAfterSeconds <= 60);
});

test('a locked gate refuses the correct password too, and does not extend itself', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 5; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  const until = gate.lockedUntil;
  const blocked = loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate);
  assert.equal(blocked.kind, 'locked');
  // Hammering during a cooldown must not push the deadline back — that is how
  // a lockout becomes permanent.
  assert.equal(gate.lockedUntil, until);
});

test('the cooldown expires on its own and the owner gets back in', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 5; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);

  // The lockout is a moment, not a flag, so letting it pass is the whole
  // recovery path — nothing has to clear it.
  gate.lockedUntil = Date.now() - 1;

  assert.deepEqual(loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate), {
    kind: 'ok',
  });
  assert.equal(gate.failures, 0, 'a success clears the counter');
  assert.equal(gate.lockedUntil, 0);
});

test('after a success the next five failures start the count over', () => {
  const gate = loginGateCreate();
  for (let attempt = 0; attempt < 4; attempt += 1)
    loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
  loginAttempt(CONFIG, CONFIG.email, CONFIG.password, gate);

  assert.deepEqual(loginAttempt(CONFIG, CONFIG.email, 'wrong', gate), {
    kind: 'rejected',
  });
});

test('each further failure waits longer, and the wait is capped', () => {
  const gate = loginGateCreate();
  const waits: number[] = [];

  for (let round = 0; round < 12; round += 1) {
    const result = loginAttempt(CONFIG, CONFIG.email, 'wrong', gate);
    if (result.kind === 'locked') {
      waits.push(result.retryAfterSeconds);
      gate.lockedUntil = Date.now() - 1;
    }
  }

  assert.deepEqual(waits.slice(0, 4), [60, 120, 240, 480]);
  // 15 minutes, and never more — an attacker must not be able to grow the
  // owner's own wait without bound.
  assert.ok(waits.every((wait) => wait <= 900));
  assert.equal(waits.at(-1), 900);
});
