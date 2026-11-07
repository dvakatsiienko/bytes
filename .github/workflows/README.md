# the review gate, on one screen

a pr reaches `main` through one door: `x lane merge-auto <pr> --apply`.

1. codie says «final» and runs `x lane review <pr>`. that adds the `🤖 review:requested` label.
2. `review.yml` sees the label and calls `review-round.yml` at bytes `main`. frame's `review.yml` calls the same copy.
3. the round reads its cap through `.github/scripts/review-rounds.sh`, taken from `main`. one round per branch; a second runs only when dima applies the label himself.
4. the reviewer posts inline threads. they are advice: no check goes red over a finding.
5. if the reviewer posted nothing, the last step ends the run red. that is a stand-down, and it counts as no round.
6. sixth sense reads the head and records its clean.
7. `x lane merge-auto` lands the pr when all of these hold:
   - sixth sense is clean on the head
   - the required checks are green: `lint + typecheck + test + build`, `apps essentials`, `skip-marker`
   - the reviewer job finished a round on an ancestor of the head, or a rebase kept its code
   - no review thread is open
   - the brake is off, and a self-edit has dima's word

## the other paths

- **a round that stood down**: it holds no round. merge-auto names the door, `--dima-ok <pr>`, on dima's prompt or a tick quoting that pr.
- **a pr that edits `review.yml` or `review-round.yml`**: a self-edit, so it needs that same word, round or no round.
- **a renovate pr**: needs no round. its automerge group merges itself on ci. merge-auto lands one made only of renovate's own signed commits with no clean; a member's commit or a changed workflow file asks a clean, and an action bump never automerges.

## not here on purpose

- a review on every push: it would read unfinished work.
- a raw `gh pr merge`: `x-mod-guard` refuses it from a session. the web button stays dima's own escape.
