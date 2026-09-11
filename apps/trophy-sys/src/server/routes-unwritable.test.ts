import { assert, expect, test } from 'vitest';

/**
 * The broken deploy: a serverless host with no KV credentials, so `state.ts`
 * falls back to a file backend it cannot write. Every route that would persist
 * something must answer 501 **before** doing the work, or it spends thirty PSN
 * calls and dies on EROFS.
 *
 * `isStateWritable` is computed once when `state.ts` is imported, so this file
 * has to arrange the environment before the import — which is why it is a file
 * of its own. Vitest isolates each file in its own worker, so nothing here
 * reaches the other suites.
 */

process.env.VERCEL = '1';
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;

process.env.ADMIN_EMAIL = 'owner@example.com';
process.env.ADMIN_PASSWORD = 'correct horse';
process.env.ADMIN_SECRET = 'test-secret';

const { ADMIN_COOKIE, adminConfig, cookieRead, sessionCookie } = await import(
  './admin.ts'
);
const { isStateWritable, stateBackend } = await import('./state.ts');
const { routeResolve } = await import('./routes.ts');

test('the environment under test is the broken one', () => {
  // If this drifts, every assertion below passes for the wrong reason.
  expect(stateBackend).toBe('file');
  expect(isStateWritable).toBe(false);
});

const config = adminConfig();
// assert.ok, not expect: only the assertion signature narrows `config` away
// from null for every route call below.
assert.ok(config, 'the admin trio was set above');

const signedIn = {
  cookie: `${ADMIN_COOKIE}=${cookieRead(sessionCookie(config, 'example.com'), ADMIN_COOKIE)}`,
  host: 'example.com',
};

const MENTIONS_KV = /KV/;

const post = (path: string, body: unknown = null, cookie?: string) =>
  routeResolve(new URL(`https://example.com${path}`), 'POST', {
    body,
    headers: { cookie, host: 'example.com' },
  });

test('a snapshot refuses with 501 instead of scanning PSN first', async () => {
  const result = await post('/api/snapshot');
  expect(result.status).toBe(501);
  expect(String((result.body as { error: string }).error)).toMatch(MENTIONS_KV);
});

test('a stats sync refuses with 501', async () => {
  const result = await post('/api/stats/sync');
  expect(result.status).toBe(501);
});

test('a signed-in admin write refuses with 501 rather than pretending it saved', async () => {
  const hidden = await post(
    '/api/admin/hidden',
    { ids: ['NPWR1_00'] },
    signedIn.cookie,
  );
  expect(hidden.status).toBe(501);

  const settings = await post(
    '/api/admin/settings',
    { effortHideUntouched: true },
    signedIn.cookie,
  );
  expect(settings.status).toBe(501);
});

test('the 501 is reached before the payload is validated', async () => {
  // A deliberately invalid body: 400 here would mean the writability check sits
  // after the parse, and the route would be reporting the wrong problem.
  const result = await post(
    '/api/admin/hidden',
    { ids: 'nope' },
    signedIn.cookie,
  );
  expect(result.status).toBe(501);
});

test('a read-only admin route still answers while the store is unwritable', async () => {
  const session = await routeResolve(
    new URL('https://example.com/api/admin/session'),
    'GET',
    { body: null, headers: { cookie: signedIn.cookie, host: 'example.com' } },
  );
  expect(session.status).toBe(200);
  expect(session.body).toStrictEqual({ authed: true });
});

test('an unsigned request is turned away before the store is consulted', async () => {
  const result = await post('/api/admin/hidden', { ids: [] });
  expect(result.status).toBe(401);
});

/**
 * The unconfigured deploy, the other shut-by-default case: a missing admin var
 * must close every admin route rather than open it. `adminConfig()` is read per
 * request, so the trio can be pulled out and put back here.
 */
test('every admin route answers 503 when the admin vars are missing', async () => {
  const saved = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.ADMIN_SECRET,
  };
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SECRET;

  try {
    const paths = [
      '/api/admin/session',
      '/api/admin/login',
      '/api/admin/hidden',
    ];
    // Even with a cookie that was valid a moment ago — no secret, no trust.
    const results = await Promise.all(
      paths.map(async (path) => ({
        path,
        status: (await post(path, { ids: [] }, signedIn.cookie)).status,
      })),
    );

    for (const { path, status } of results) expect(status, path).toBe(503);
  } finally {
    process.env.ADMIN_EMAIL = saved.email;
    process.env.ADMIN_PASSWORD = saved.password;
    process.env.ADMIN_SECRET = saved.secret;
  }
});
