import type { AuthTokensResponse, AuthorizationPayload } from 'psn-api';
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
} from 'psn-api';

import { NPSSO_INVALID } from '../shared/types.ts';
import type { RefreshGrant } from './state.ts';
import {
  isAutoWriteSafe,
  npssoDeathRecord,
  npssoLoad,
  refreshGrantDeathRecord,
  refreshGrantLoad,
  refreshGrantSave,
} from './state.ts';

interface Session {
  auth: AuthorizationPayload;
  expiresAt: number;
  /** The grant this session came from, carried so a refresh keeps its mint date. */
  grant: RefreshGrant;
}

let session: Session | null = null;

/**
 * KV is the source of the NPSSO. `process.env.NPSSO` is a bootstrap seed and
 * nothing more: it carries a deploy that has never been pasted into, and the
 * first paste retires it for good. Renewing an expired token must not need a
 * redeploy, which is the whole reason the store outranks it.
 */
const npssoRead = async () => {
  const npsso = (await npssoLoad()) ?? process.env.NPSSO;
  if (!npsso)
    throw new Error(
      'NPSSO missing — paste one on the admin page, or seed it in .env locally and as a Vercel env var for a first deploy',
    );

  return npsso;
};

/**
 * psn-api answers a refused NPSSO with prose naming the access code, and the
 * only other thing it could plausibly be is a transport failure — which carries
 * a node error code instead. Matching the prose is fragile, so the fallback is
 * the safe direction: an unrecognised error is NOT recorded as a death.
 */
const rejection = (cause: unknown) => {
  if (typeof cause === 'object' && cause !== null && 'code' in cause)
    return false;

  return REFUSAL.test(cause instanceof Error ? cause.message : String(cause));
};

const REFUSAL = /access code|npsso/iu;

/**
 * A session from PSN's token response, or null when the response is not one.
 *
 * ⚠️ The shape IS the error check. psn-api never looks at the response status
 * on either token call: a refused refresh grant comes back as `{}` rather than
 * a thrown error (measured 2026-09-11), and a session built from that carries
 * `expiresAt: NaN`, which compares false against every clock — so every later
 * call re-mints, against a rate-limited api, forever.
 */
const sessionBuild = (
  tokens: AuthTokensResponse,
  // Null on a mint: this response IS the origin, so both figures come from it.
  origin: Pick<RefreshGrant, 'mintedAt' | 'mintedExpiresIn'> | null,
): Session | null => {
  if (!(tokens.accessToken && tokens.refreshToken && tokens.expiresIn))
    return null;

  const expiresIn = numberOr(tokens.refreshTokenExpiresIn, 0);

  return {
    auth: { accessToken: tokens.accessToken },
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    grant: {
      expiresIn,
      mintedAt: origin?.mintedAt ?? Date.now(),
      mintedExpiresIn: origin?.mintedExpiresIn ?? expiresIn,
      refreshedAt: Date.now(),
      token: tokens.refreshToken,
    },
  };
};

const sessionMint = async (): Promise<Session> => {
  const npsso = await npssoRead();

  let tokens: AuthTokensResponse;
  try {
    tokens = await exchangeAccessCodeForAuthTokens(
      await exchangeNpssoForAccessCode(npsso),
    );
  } catch (cause) {
    // ⚠️ Only a refusal counts as a death. A timeout, a DNS failure or a PSN
    // outage reaches this same catch, and treating one as an expired token both
    // poisons the lifetime measurement with a false sample and tells the owner
    // to go fetch a code that is perfectly fine.
    if (!rejection(cause)) throw cause;

    // Names the token that failed, so a rejection racing a fresh paste cannot
    // write the dead one back. Stamps the death once, so the next token's age
    // can be compared against a measured lifetime rather than folklore.
    // Behind `isAutoWriteSafe` like the grant deaths: a local run on production
    // KV must not stamp its own refusal into the live lifetime history.
    if (isAutoWriteSafe) await npssoDeathRecord(npsso);
    throw new Error(NPSSO_INVALID, { cause });
  }

  const minted = sessionBuild(tokens, null);
  // Not an NPSSO death: the access code was issued, so the token PSN refused to
  // honour is not the one the owner would be sent to replace.
  if (!minted)
    throw new Error('PSN returned no tokens for an accepted access code');

  return minted;
};

/**
 * One access token, however it can be had: the grant this process already
 * holds, the one in the store, and only then a fresh NPSSO exchange.
 *
 * The order is the whole feature. The NPSSO is the scarce half — it expires in
 * weeks, no code can renew it, and every cold serverless start used to spend one
 * on the access-code exchange. A stored grant costs one PSN call and no NPSSO.
 */
const sessionRefreshOrMint = async (): Promise<Session> => {
  // ⚠️ The store, never this process's own copy, even when it holds one. The
  // epoch guard is module-local, so it cannot see a paste made anywhere else:
  // a second warm instance refreshing from its own `session.grant` would
  // succeed — PSN does not rotate the token — and write the retired grant back
  // over the key `npssoSet` had cleared, with no race needed and nothing in the
  // record able to say it was retired. Reading the store costs one round-trip
  // per access-token expiry and makes an empty store mean what it should:
  // the owner pasted, mint from the new token.
  const held = await refreshGrantLoad();
  if (!held) return await sessionMint();

  const refreshed = sessionBuild(
    await exchangeRefreshTokenForAuthTokens(held.token),
    held,
  );
  if (refreshed) return await sessionRenewEarly(refreshed);

  // ⚠️ A weaker sample than the NPSSO's. psn-api maps seven token fields and
  // drops the error body, so a genuine `invalid_grant` and a PSN `server_error`
  // both arrive as `{}` — a bad hour at Sony can therefore log a grant as dead
  // early. A transport failure is still safe (it throws, and never reaches
  // here), and the fallback below is correct either way; only the measurement
  // can be poisoned. The readout under-claims accordingly.
  //
  // 📌 Behind the same guard as the grant write, and for a stronger reason: a
  // death IS the measurement, so a local run on production KV turning one PSN
  // blip into a false sample is exactly what this record must not collect.
  if (isAutoWriteSafe) await refreshGrantDeathRecord(held);

  return await sessionMint();
};

/**
 * Swaps a grant with three days or less left for a fresh one from the NPSSO,
 * while the old grant still works.
 *
 * The grant's end is where a quietly dead NPSSO (a logout anywhere on
 * playstation web kills it) is first found out. Moving that moment three days
 * early turns it into a check with room: a live NPSSO gets a fresh ten-day
 * grant, and a dead one is recorded — /console shows it — while the old grant
 * keeps every route up. Any failure here answers with the refreshed session,
 * because the call that asked for a token must not pay for a check it never
 * asked for.
 *
 * 📌 While the NPSSO is dead this runs once per access-token expiry (an hour)
 * until the old grant ends: at most ~72 extra PSN calls, each one refused.
 */
const sessionRenewEarly = async (refreshed: Session): Promise<Session> => {
  const leftMs = refreshed.grant.expiresIn * 1000;
  // 0 is `sessionBuild`'s stand-in for an expiry PSN did not report — unknown,
  // not ending. Read as ending, every access-token expiry would spend the NPSSO.
  if (leftMs === 0 || leftMs > GRANT_RENEW_MS) return refreshed;

  try {
    return await sessionMint();
  } catch (cause) {
    if (!(cause instanceof Error && cause.message === NPSSO_INVALID))
      console.error('psn early re-mint failed', cause);

    return refreshed;
  }
};

const GRANT_RENEW_MS = 3 * 86_400_000;

/**
 * The memoised half of `authGet`: one session, and one write of the grant it
 * carries. The write lives here rather than in `authGet` because every caller
 * arriving during a mint awaits this same promise — persisting there stored the
 * identical record once per concurrent caller.
 */
const sessionGet = async (): Promise<Session> => {
  const started = epoch;
  const fresh = await sessionRefreshOrMint();

  // A reset landed while this was in flight, so `fresh` was built from
  // credentials the owner has since replaced. It still answers the call that
  // asked for it, but it must not be written anywhere.
  if (started === epoch) await grantPersist(fresh.grant);

  return fresh;
};

/**
 * The store is the point: a grant held only in memory dies with the process,
 * which is the state this whole path exists to end. Failing to write it must not
 * fail the call that was actually asked for, so it is logged and swallowed.
 *
 * ⚠️ `isAutoWriteSafe`, not `isStateWritable` — nobody asks for this write, it
 * rides along on whatever route ran. The tempting argument against it is that a
 * grant is the session rather than data, and PSN hands back the same token on
 * every refresh, so two writers cannot disagree. That holds for the token and
 * fails for `mintedAt`: a local run pointed at production KV mints its own grant
 * and stamps a fresh mint date over the live one, which is the measurement.
 */
const grantPersist = async (grant: RefreshGrant) => {
  if (!isAutoWriteSafe) return;

  try {
    await refreshGrantSave(grant);
  } catch (cause) {
    console.error('psn refresh grant not persisted', cause);
  }
};

/**
 * Bumped by every reset, and captured by anything holding credentials across an
 * await.
 *
 * ⚠️ Clearing `session` and `minting` does not reach work already in flight. A
 * refresh that started before a fresh NPSSO was pasted still resolves after it,
 * and without this counter it would install the superseded session AND write its
 * grant back over the one `npssoSet` had just cleared — restoring the replaced
 * credentials for up to the grant's ten days. It is the same lost update the
 * NPSSO deaths key is split out to avoid, one layer up.
 */
let epoch = 0;

/**
 * Drops the cached session so the next call rebuilds one from the store.
 *
 * 📌 It does **not** force an NPSSO exchange any more — the next call finds the
 * stored refresh grant and uses that. A caller who needs the NPSSO itself
 * retried clears the grant too; `npssoSet` in `admin.ts` is the one that does.
 */
export const sessionReset = () => {
  session = null;
  minting = null;
  epoch += 1;
};

/**
 * Shared by every caller that arrives while a mint is in flight. Without it a
 * cold process answering several routes at once ran one NPSSO exchange each —
 * against a rate-limited api, and each failure recording the same death again.
 */
let minting: Promise<Session> | null = null;

export const authGet = async (): Promise<AuthorizationPayload> => {
  if (session && session.expiresAt > Date.now() + 60_000) return session.auth;

  const started = epoch;
  minting ??= sessionGet();

  let fresh: Session;
  try {
    fresh = await minting;
  } finally {
    // Cleared either way: a memoised rejection would make one expired token
    // permanent for the life of the process.
    minting = null;
  }

  // Superseded by a reset mid-flight — answer this caller, but leave the cache
  // empty so the next one builds from whatever the owner just pasted.
  if (started === epoch) session = fresh;

  return fresh.auth;
};

/**
 * PSN hands these back as strings, and a malformed one turns into NaN that
 * survives every downstream check — a NaN rarity silently falls out of every
 * bucket in the rarity chart rather than showing up as wrong.
 */
export const numberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
