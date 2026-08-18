# Labels

**Linear** (workspace `x-com`, teams `BYT` / `DOT`) is the sole authoritative tracker.
GitHub issues retired 2026-08 — closed history only, never operated.

## Linear — workspace-level label families

Labels are defined **once at the workspace**, never per project. A label that encodes what a
project is about is banned: projects carry that meaning, labels do not.

**role** — who or what the ticket is waiting on.

| label | meaning |
| ----- | ------- |
| `needs human` | only Dima can move it |
| `needs agent` | ready for an agent to pick up |
| `needs data` | blocked on facts (renamed from `research`) |

**kind** — what the ticket is.

| label | meaning |
| ----- | ------- |
| `bug` | something is broken |
| `feature` | something new |
| `improvement` | something existing, made better |

**special**

| label | meaning |
| ----- | ------- |
| `standing` | never finishes — homes in In Progress between rounds |
| `vet` | 🧪 on trial; mutates to `investigate` when the trial fails |
| `walkthrough` | Dima's walkthrough mark |

**model routing** — which model the work is aimed at: `fable-5`, `opus-5`, `sonnet-5`.

Deleted: `harness: home baked`.
