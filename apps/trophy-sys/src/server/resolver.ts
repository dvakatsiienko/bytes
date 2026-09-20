import { lookup, resolve4, resolve6 } from 'node:dns';
import { Agent, setGlobalDispatcher } from 'undici';

import type { LookupFunction } from 'node:net';

/**
 * macOS resolves through `mDNSResponder`, and that cache can hold a poisoned
 * negative answer for one host while every other host works (measured
 * 2026-09-20: `dig ca.account.sony.com` answered, `ping` and `getaddrinfo`
 * said ENOTFOUND, and every PSN verb died with `TypeError: fetch failed`).
 * `dns.resolve4` asks the nameserver directly and never sees that cache, so a
 * failed system lookup falls through to it. Local entries only: vercel has no
 * `mDNSResponder`, and the handler bundle stays without undici.
 */
export const lookupResilient: LookupFunction = (
  hostname,
  options,
  callback,
) => {
  lookup(hostname, options, (error, address, family) => {
    if (!(error && RESOLVER_CODES.has(error.code ?? ''))) {
      return callback(error, address, family);
    }
    resolve4(hostname, (error4, addresses4) => {
      if (!error4 && addresses4[0]) return callback(null, addresses4[0], 4);
      resolve6(hostname, (error6, addresses6) => {
        if (!error6 && addresses6[0]) return callback(null, addresses6[0], 6);
        callback(error, '', 0);
      });
    });
  });
};

export const resolverInstall = () =>
  setGlobalDispatcher(new Agent({ connect: { lookup: lookupResilient } }));

/**
 * From the output alone a resolver fault, a PSN outage and a dead credential
 * read the same. `dig <host>` answering while `ping <host>` does not is the
 * discriminator, every time; the one line says so and names the fix.
 */
export const resolverExplain = (error: unknown) => {
  const cause = error instanceof Error ? error.cause : null;
  const code =
    cause instanceof Error && 'code' in cause ? String(cause.code) : '';
  if (!RESOLVER_CODES.has(code)) return null;
  const host =
    cause instanceof Error && 'hostname' in cause
      ? String(cause.hostname)
      : 'the host';
  return `${code} for ${host} — the local resolver, not the service. if \`dig ${host}\` answers and \`ping ${host}\` does not, mDNSResponder holds a stale negative entry: sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`;
};

/* Helpers */
const RESOLVER_CODES = new Set(['ENOTFOUND', 'EAI_AGAIN']);
