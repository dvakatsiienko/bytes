# REVIEW.md: bytes

what every reviewer of a bytes diff reads first: the local cards, the built-in `/code-review`, sixth sense and the ci reviewer. it says what a failure looks like here and how a finding is written. the code's own rules stay where they live, named below. one root file: no app has its own repeated findings yet (40 merged prs read, 2026-11-09), so an app's lines sit here until one does.

## a finding

- each finding is a `path:line`, a concrete failure (an input and the wrong outcome) and a one-line fix
- a bug blocks; a nit is reported once, at the end, and never raised again on a later round
- a re-review reads only the diff since the last round, against the findings already raised; it says which are fixed, which are answered and which stand
- the summary opens with the count; with nothing to fix it says «nothing to fix» and stops
- a claim the reviewer could not run is labelled «not run», never written as checked

## what a failure looks like, per area

- a workflow (`.github/workflows/`): a comment or a stated reason that no longer matches what the step does; a pr that can edit the workflow judging it, or run its own code past a guard; a green step that ran nothing (a skipped job reads as success)
- deploy and build config (`turbo.jsonc`, `pnpm-workspace.yaml`, the lockfile, a `vercel.json`): a change that marks every app affected and redeploys them all, an env var a task needs left out of `globalPassThroughEnv`, a pushed branch whose `vercel.json` lacks the deploy opt-out
- a gate (`script/`, `lefthook.yaml`): it misfires on a case it is meant to handle, or reds a change it never covered
- trophy-sys: a local run whose env-file order writes to the production kv in `.env.local`; `dev:api` reading `PORT` instead of `API_PORT` / `PORT_OFFSET`; a title's absence from psn's `games` taken as never played
- a 🐾 pet app (x-com-chat, space-explorer, financial): its basic setup flagged or hardened as a defect; it is basic on purpose
- ui in any app: a component built in the app that `packages/kit` should hold, routing state put in search params instead of the path
- a test, anywhere: it reads live state or a symlinked live store instead of copied rows, or its red was never proven on the line it guards
- an app with `FTR.md`: a change to what the app does with no ftr line, or a new domain word with no `GLOSSARY.md` entry

## the standards it checks against

- `AGENTS.md` at the repo root and the app's own beside each touched file; `packages/kit/AGENTS.md` for any ui
- the `x:guide-code` skill, then `x:guide-typescript` or `x:guide-react` for the file's language
- an app's `FTR.md`, whose lines are the behaviour a change must keep, and its `DESIGN.md` for anything rendered
- beyond the documented rules, the Fowler smells (a mysterious name, duplicated code, speculative generality, a middle man) are judgement calls, labelled «possible <smell>», and a documented rule overrides them

## paths to skip

- generated files: the `!` paths in `biome.jsonc` (svg, `.generated`, `_generated`, `prisma-client`, `graphql/generated`, `next-env.d.ts`), `pnpm-lock.yaml`, `assets/badges/` and `assets/apps/`
- next's managed `nextjs-agent-rules` block in an app's `AGENTS.md`, written by `next dev`
