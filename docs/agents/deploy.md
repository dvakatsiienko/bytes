# bytes — deployment

read before touching a `vercel.json`, `.github/workflows/`, `turbo.jsonc` `globalDependencies`, or deploying by hand.

<!-- 2026-09-12 · deployment shape is deliberately unoptimal: vercel's git integration is off and a ci job curls deploy hooks for the apps turbo lists as affected (BYT-84). the reason is the hobby plan: every git push created six deployments and the branch gates only CANCEL them, and a canceled deployment still counts toward «Deployments Created per Day: 100» (vercel docs, monorepos + limits pages, 2026-08). on a pro plan (6000/day) the git integration would simply stay on and this job would not exist. revisit if the plan changes. -->

Prefer a committed `vercel.json` over the Vercel dashboard. Dashboard-only settings are invisible
to agents and to code review, and they silently override the repo — a dashboard edit to
`trophy-sys`'s Root Directory once broke a deploy that no diff could explain. Six apps have one —
`cv`, `figmentation`, `financial`, `space-explorer-ui`, `trophy-sys`, `x-com-chat`. `sketchbook`,
`atelier`, `design-loupe` and `space-explorer-api` do not; `space-explorer-api` deploys on Railway
instead, from `railway.json`, and `atelier` and `design-loupe` never deploy — they are local tools.

**Vercel's git integration is off.** Every `vercel.json` carries `git.deploymentEnabled: false` —
the bool, not the branch-prefix object it replaced. The object never stopped a deployment being
created, it only let Vercel CANCEL one afterwards, and a canceled deployment still counts against
the hobby «Deployments Created per Day» cap. The bool is the only form with no webhook path at all.

**`.github/workflows/deploy.yml` is the trigger, and the only one.** When CI goes green on a `main`
push (`workflow_run`), it asks turbo which packages changed since the last real deploy, and POSTs a
Vercel deploy hook for each affected app. A red CI on `main` deploys nothing; the next green push carries those apps.
Vercel still clones, builds with its own cache and keeps its own logs; it no longer decides when.
The urls live in the repo secret `VERCEL_DEPLOY_HOOKS`, a json object keyed by APP DIRECTORY name
(`space-explorer-ui`, not the package name `@space-explorer/ui`). One hook per project, named
`ci-main`, bound to `main`; manage them with `vercel deploy-hooks list|create|remove`.

⚠️ **`[skip ci]` on a `main` commit now means «do not deploy».** It skips every push-triggered
workflow, CI included, so the apps that commit changed stay stale in production until the next green
CI on `main` (Deploy diffs from the last real deploy) or a manual run. Vercel used to deploy regardless of the directive; this
job is the only trigger now, and GitHub gives a workflow no way to opt out of it.

⚠️ **Never set `github.enabled: false`.** Vercel documents that one as disabling deploy hooks
outright, which would leave nothing able to deploy. `git.deploymentEnabled: false` does not touch
them — measured on BYT-84: a hook built a branch that carried the bool.

📌 **Previews come only by label.** A branch push builds nothing. The `🚀 deploy:preview` label on a
PR runs `.github/workflows/preview.yml`: a Vercel preview of every app the PR touches (by changed
paths, `preview-apps.sh` says the rule), the urls in a
comment, the label taken off again (add it again to redeploy). Each preview counts on the daily cap,
so use it where CI cannot reach — `x-com-chat`'s bumps above all (prerender calls Convex, so CI
cannot build it). Project ids live in `.github/vercel-projects.json`; a new Vercel app adds its line.

📌 A root file that carries no dependencies — `AGENTS.md`, `.node-version` — deploys nothing,
because turbo reports nothing affected. A root manifest or lockfile change marks every package
affected, so a renovate bump does reach production. Both measured on BYT-84.

⚠️ **A root file that changes a BUILD must be a `globalDependencies` entry in `turbo.jsonc`, or
the commit that fixes production deploys nothing and exits green.** `.npmrc` and
`pnpm-workspace.yaml` are there for exactly that reason — the first carries `public-hoist-pattern[]`,
the second `allowBuilds`. Add any future file of that kind to the same key; a path list in the
deploy script would go stale, turbo's own answer does not.

📌 `--affected` is task-level (`futureFlags.affectedUsingTaskInputs`): a task is selected only when a
changed file matches its own `inputs`. `build.inputs` drops `README.md`, `CLAUDE.md`, `AGENTS.md`
and `.claude/**`, so a docs- or skills-only push deploys nothing. `typecheck` and `lint` still
select on any file; `test` skips `README.md` and `CLAUDE.md` (BYT-106, measured in a clone).

To deploy by hand — a build that died on Vercel's side, a commit that carried the skip directive —
run the **Deploy** workflow from the Actions tab and pick an app, or `all`. The Vercel dashboard's
Redeploy button also still works.

**An app removed from `apps/` takes its GitHub environments with it, in the same change** — its
`Production – <app>` and `Preview – <app>` rows otherwise sit in the repo's Deployments sidebar
forever (13 such rows were pruned on 2026-09-23). `gh api repos/dvakatsiienko/bytes/environments
-q '.environments[].name'` lists them; `gh api -X DELETE .../environments/<url-encoded name>`
removes one.
