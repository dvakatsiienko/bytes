# The console fails shut, and counts failed logins once for the whole deployment

The console sits on a public url and has exactly one legitimate user. Its credentials live in three env vars, never in code, and when any of them is missing every admin route answers 503 — a misconfigured deploy is never an open one. Failed logins are counted by one shared KV counter for the whole deployment, not per IP: `x-forwarded-for` is a request header, so per-IP buckets would hand an attacker a free reset per forged value. The correct password is checked before the lockout and always wins, because the console is the page a locked-out owner needs to renew his NPSSO.

## Considered options

- **An in-process counter** — the first build. On serverless it reset with every cold start and was not shared between instances, so it was a speed bump; the KV counter replaced it on 2026-09-28.
- **A doubling cooldown** — let a slow trickle of wrong guesses escalate the owner's own wait; every cooldown is now one flat minute.
