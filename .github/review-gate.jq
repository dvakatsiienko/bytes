# The review gate's decision, as a pure function of what the api returned.
#
# It lives in a file rather than inside the workflow because a decision embedded
# in yaml can only be exercised by spending a review round on a real PR, and a PR
# that changes it makes the action refuse itself. Here it is fed saved payloads by
# `.github/scripts/review-cases.sh`, which is what proves a findings round goes
# red without waiting for a findings round to happen.
#
# Input  { artifacts, threads }
#          artifacts  every comment/review the round may have written, folded
#          threads    pulls/N/comments — the inline finding threads
# Args   who app author owner since
#          who     the reviewer app's login, `<slug>[bot]`
#          app     the reviewer app's slug, as the api reports it on a comment
#          author  the PR's own author
#          owner   the repo owner — the other account whose reply clears a finding
#          since   the moment the round started
# Output { conclusion, title, summary, standdown, posted, verdict, open }
#          standdown   the action refused itself and no reviewer was spent, so
#                      the round must not count against the cap
#
# 📌 There was a second mode here, for a lane that tried to decide without a
# reviewer whether a push had answered the last round's findings. It is gone with
# that lane: «is this finding answered» is not a question an api can settle, and
# the five defects it produced on #79 all came from pretending otherwise. Past
# the cap, Dima approves and `review-approved.yml` publishes the check.

# The round's own artifacts. A login test alone is not quite enough:
# `use_sticky_comment` reuses an existing tracking comment, and an edit does not
# change a comment's author — one first written by `claude[bot]` still reads as
# `claude[bot]` after the reviewer writes its verdict into it.
#
# 🚨 The second clause is an IDENTITY, never a body. Two earlier versions asked
# the prose: first «any comment carrying the job-run url», then «a login
# containing `claude` carrying it». Both were forgeable by the reviewed party —
# the second because `claude.yml` carries `allowed_bots: "x-coder-cc[bot]"`, so
# the coder can reach the assist lane with `@cc` and have `claude[bot]` write
# whatever it is told to write, run url and `verdict: clean` included.
#
# 📌 `performed_via_github_app` is present on ISSUE comments only — measured:
# absent on `pulls/N/comments` and on `pulls/N/reviews`. That is exactly where it
# is needed, since the verdict lives in the sticky comment, which is an issue
# comment. Everything else the reviewer writes matches on `$who`.
#
# 🚨 `$app != ""` is not defensive noise. With `$app` empty, `("" // "") == ""`
# is true of every artifact that does not carry the field — so `ours` would match
# every comment on the PR and the verdict would be read out of anybody's, while
# `$who` (built as `<slug>[bot]`, so `"[bot]"`) matched nothing. Not a degraded
# gate, an inverted one: `verdict: clean` is three words the coder can type.
def ours:
  select(.user.login == $who
         or (($app != "") and ((.performed_via_github_app.slug // "") == $app)));

# Freshness, not creation: an edit moves `updated_at` and leaves `created_at` at
# the round that first created the comment.
def touched: select(((.updated_at // .submitted_at // "") > $since));

# A reply that clears a finding: the PR's own author, or the repo owner. Anyone
# else's reply is a comment, not an answer — the repo is public, and a green a
# passer-by can hand out is not a gate. The owner is named so Dima can answer a
# finding on a PR he opened himself, which a hardcoded coder login once made
# impossible.
def answerer: select(.user.login != $who and (.user.login == $author or .user.login == $owner));

. as $in

| ([$in.artifacts // [] | .[] | ours | touched]) as $arts
| ($arts | length) as $posted

# The reviewer asserts its own verdict on a line of its own. Anchored per line so
# the words cannot be matched inside prose or inside a url-encoded fix link, and
# `findings` wins over `clean` if both ever appear — the gate fails closed.
| ([$arts[]
    | (.body // "")
    | split("\n")[]
    | select(test("^[[:space:]]*[*`]{0,2}verdict:[[:space:]]*(clean|findings)[*`]{0,2}[[:space:]]*$"))
    | if test("findings") then "findings" else "clean" end]) as $verdicts
| (if ($verdicts | any(. == "findings")) then "findings"
   elif ($verdicts | any(. == "clean")) then "clean"
   else null end) as $verdict

| ($in.threads // []) as $all
| ([$all[] | select(.user.login == $who and .created_at > $since)]
   | map(. as $f
       | (($f.in_reply_to_id // $f.id)) as $root
       | {path: $f.path,
          line: ($f.line // $f.original_line),
          # 🚨 The reply must be NEWER than the finding it answers. Without the
          # time bound, `answered` asks only «does this thread hold an answerer
          # comment», so a re-review — which the prompt asks to post inside the
          # existing thread — is pre-answered by the previous round's reply.
          answered: ([$all[]
                      | answerer
                      | select(((.in_reply_to_id // .id) == $root) and (.created_at > $f.created_at))]
                     | length > 0)})) as $raised
| ($raised | map(select(.answered | not))) as $unanswered
| ($unanswered | length) as $open
| ($unanswered | map("- `\(.path):\(.line)`") | join("\n")) as $openlist

| {posted: $posted, verdict: $verdict, open: $open, standdown: false}
  + (if $posted == 0 then
      {conclusion: "failure", standdown: true,
       title: "no review was posted",
       summary: "The review job finished without posting anything. A green check would claim a review that never happened. This is what a PR editing a workflow already on the default branch looks like: the action refuses itself."}
    elif $verdict == null then
      {conclusion: "failure",
       title: "the reviewer stated no verdict",
       summary: "The review ran but its comment carries no `verdict: clean` or `verdict: findings` line, so what it concluded is unknown. An unknown conclusion is not a clean review."}
    elif $verdict == "findings" then
      {conclusion: "failure",
       title: "the reviewer's verdict is findings",
       summary: ((if $open > 0 then "Unanswered on this head:\n\($openlist)\n\n" else "" end)
                 + "Fix what it found, or answer each finding with a reason, then re-apply the label.")}

    # 🚨 There is deliberately NO «and zero unanswered threads» clause here.
    # `$raised` is every comment the reviewer posts during a round, and nothing
    # distinguishes a finding from an acknowledgement — the guard runs seconds
    # later, so nothing has been replied to. Any round where the reviewer touched
    # a thread went red, a clean one included, while the prompt asks it to say
    # inside the thread which findings are fixed.
    #
    # The verdict is the single authority. `clean` is defined to the reviewer as
    # «nothing you raised still stands», so a thread count that overrides it is
    # the old broken proxy outvoting the thing that replaced it. `$open` stays in
    # the output because it is worth reading in the check's log.
    else
      {conclusion: "success",
       title: "clean on this head",
       summary: "The reviewer posted \($posted) artifact(s) on this head and said `verdict: clean` — its own assertion that nothing it raised still stands."}
    end)
