# Labels

Two trackers touch this repo. **Linear** (workspace `x-com`, teams `BYT` / `DOT`) is where
Dima's work is planned. **GitHub issues** is this repo's own tracker — see
`docs/agents/issue-tracker.md`.

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

## GitHub issues — this repo's triage labels

The skills speak in five canonical triage roles; these are the label strings in this repo.

| Label in mattpocock/skills | Label here | Meaning |
| -------------------------- | ---------- | ------- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | `ready-for-human` | Requires human implementation |
| `wontfix` | `wontfix` | Will not be actioned |

Every GitHub issue also carries an **app label** scoping it to a monorepo app
(`x-com-chat`, `cv`, `financial`, …).
