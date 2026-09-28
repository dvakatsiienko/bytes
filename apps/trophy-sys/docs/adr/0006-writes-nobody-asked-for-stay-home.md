# A write nobody asked for lands only in the process's own store

A developer's `.env.local` carries the production KV credentials, and several writes ride along on reads — the archive healing itself, a refreshed grant, a recorded death. A local `pnpm dev` once moved the live archive from 2122 to 2126 rows with nobody pressing anything. So every unasked write is gated by `isAutoWriteSafe`: Vercel may write KV, a local run may write its own files, and nothing else writes at all. Asked-for writes — a paste, a snapshot, the sync button — still go where the credentials point, because that is what they were asked to do.

## Consequences

- A death or a grant is a measurement; a local run on production KV would stamp its own refusal or mint date into the live history, so those records sit behind the same gate.
- Local dev loads `.env.dev.local` last, which blanks the KV credentials, so the default local run is on the file backend.
