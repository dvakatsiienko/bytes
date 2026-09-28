# The store is the one NPSSO source; the env var is only a seed

Vercel env vars cannot be written at runtime and an NPSSO dies every few weeks, so a redeploy is the wrong way to renew one. The NPSSO lives in the store, written only by a paste in the console; `process.env.NPSSO` is read only while the store is empty, and the first paste retires it for good. There is no fallback back to the env var on a refusal.

## Considered options

- **Two live sources** — built in the follow-up and removed on the owner's word («confuses more than it protects»): it compared the pasted token with the env one, retried with the env one on a refusal, and offered a button to hand the app back to Vercel. One extra source needed four pieces of interface to explain one behaviour.
- **Unattended renewal** (a scripted Sony sign-in) — rejected 2026-09-28: Sony's login runs bot detection, its terms ban automated account access, and no PSN tool found renews unattended. Renewal stays one paste, warned about three days ahead.
