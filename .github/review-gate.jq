# The review gate's decision, as a pure function of what the api returned.
#
# It lives in a file rather than inside a workflow for two reasons. The two
# callers below read the same two things — what the reviewer concluded, and
# whether its findings carry replies — and a second copy of that predicate is
# how the two would drift. And a decision embedded in a workflow can only be
# exercised by spending a review round on a real PR, whereas this one is fed
# saved payloads by `.github/scripts/review-cases.sh`, which is what proves a
# findings round goes red without waiting for a findings round to happen.
#
#   $mode == "round"     the guard that judges a review round (review.yml)
#   $mode == "answered"  the post-cap answer check (review-answer.yml)
#
# Input  { artifacts, threads, commits }
#          artifacts  every comment/review the round may have written, folded
#          threads    pulls/N/comments — the inline finding threads
#          commits    "answered" only: the commits pushed since the last review
# Args   mode who app author owner since
#          who     the reviewer app's login, `<slug>[bot]`
#          app     the reviewer app's slug, as the api reports it on a comment
#          author  the PR's own author
#          owner   the repo owner — the other account allowed to push and answer
#          since   the moment the round started ("round") or the last round's
#                  run creation time ("answered")
# Output { conclusion, title, summary, standdown, posted, verdict, open }
#          conclusion  "success" | "failure" | "skip"  ("skip" is answered-only:
#                      publish nothing, leave the head without a check)
#          standdown   the action refused itself and no reviewer was spent, so
#                      the round must not count against the cap

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
# whatever it is told to write, run url and `verdict: clean` included. On a
# stand-down round, which is the normal case for this lane's own maintenance,
# that turned a red uncounted round into a green. The reviewer found it on
# itself, having found the looser version of it one round earlier.
#
# 📌 `performed_via_github_app` is present on ISSUE comments only — measured on
# this PR: absent on `pulls/N/comments` and on `pulls/N/reviews`. That is
# exactly where it is needed, since the verdict lives in the sticky comment,
# which is an issue comment. Everything else the reviewer writes matches on
# `$who`.
#
# 🚨 `$app != ""` is not defensive noise. With `$app` empty, `("" // "") == ""`
# is true of every artifact that does not carry the field — so `ours` would
# match every comment on the PR and the verdict would be read out of anybody's,
# while `$who` (built as `<slug>[bot]`, so `"[bot]"`) matched nothing and left
# `$open` at 0. Not a degraded gate, an inverted one: `verdict: clean` is three
# words the coder can type. An empty slug is unlikely and silent, and the
# silence landed on the permissive side. The reviewer found it.
def ours:
  select(.user.login == $who
         or (($app != "") and ((.performed_via_github_app.slug // "") == $app)));

# Freshness, not creation: an edit moves `updated_at` and leaves `created_at` at
# the round that first created the comment.
def touched: select(((.updated_at // .submitted_at // "") > $since));

# A reply that clears a finding: the PR's own author, or the repo owner. Anyone
# else's reply is a comment, not an answer — the repo is public, and a green
# that a passer-by can hand out is not a gate. The owner is named so Dima can
# answer a finding on a PR he opened himself, which a hardcoded coder login once
# made impossible.
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
          # `$open` then reads 0 over a standing finding, and the answer lane
          # publishes a green whose one claim is the one thing it never checked.
          # The reviewer found this on itself.
          answered: ([$all[]
                      | answerer
                      | select(((.in_reply_to_id // .id) == $root) and (.created_at > $f.created_at))]
                     | length > 0)})) as $raised
| ($raised | map(select(.answered | not))) as $unanswered
| ($unanswered | length) as $open
| ($unanswered | map("- `\(.path):\(.line)`") | join("\n")) as $openlist

| {posted: $posted, verdict: $verdict, open: $open, standdown: false}
  + (if $mode == "round" then
      if $posted == 0 then
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

      # 🚨 There is deliberately NO «and zero unanswered threads» clause here,
      # and it is a departure from what BYT-92 asked for. The ticket wrote
      # «`clean` + no unanswered inline threads → success» before this was known:
      # `$raised` is every comment the reviewer posts during the round, and
      # nothing distinguishes a finding from an acknowledgement. The guard runs
      # seconds later, so nobody has replied to any of them — meaning ANY round
      # where the reviewer touched a thread went red, a clean one included. The
      # prompt asks it to say which earlier findings are fixed, and the natural
      # place to say so is inside the thread, so the lane red-flagged the
      # reviewer for following its own instructions. Recovery needed a whole
      # extra opus round, or Dima.
      #
      # The verdict is the single authority, which is the entire point of this
      # ticket. `clean` is defined to the reviewer as «nothing you raised still
      # stands», so a thread count that overrides it is the old broken proxy
      # outvoting the thing that replaced it. Two authorities that can disagree
      # is the defect class this file exists to remove, not one to keep a copy
      # of. Answered mode still counts threads — there is no reviewer there to
      # ask, and counting fails closed. The reviewer found this on itself and
      # called the choice a policy one; this is the policy.
      else
        {conclusion: "success",
         title: "clean on this head",
         summary: "The reviewer posted \($posted) artifact(s) on this head and said `verdict: clean` — its own assertion that nothing it raised still stands."}
      end
    else
      # The post-cap answer check. It publishes a green or it publishes nothing:
      # a red here would paint every ordinary mid-work push as a failure, and the
      # designed default for a head nobody reviewed is already a blocked merge.
      ([$in.commits // [] | .[]
        | select((.author.login // "") != $author and (.author.login // "") != $owner)]) as $outsiders

      # 🚨 A set of answers opens exactly ONE head. Every other input here is
      # frozen at the last round — `$since`, the threads, the verdict — and
      # `$outsiders` asks only whose the new commits are, never whether any of
      # them was ever reviewed. So without this, the push that carries the
      # answers goes green (correct, the point of the lane) and then so does the
      # next one, and the next: a thousand lines the review never saw, green,
      # with a summary still naming answers three heads old. «Does this commit
      # fix a finding» is not machine-decidable; «have these answers already
      # been spent» is. The reviewer found it.
      | ([$in.commits // [] | .[] | select(.granted == true)]) as $spent

      | if $posted == 0 then
          {conclusion: "skip", title: "the last round left no readable artifact"}
        elif $verdict != "findings" then
          {conclusion: "skip", title: "the last round's verdict was \($verdict // "absent") — only a findings round can be answered"}

        # 🚨 The hole this clause closes is the one the whole ticket is about.
        # «Every finding answered» is counted from inline threads, so a round
        # that wrote its findings only into its comment raises zero threads and
        # counts zero unanswered — which is #76 exactly, six findings and a
        # green check. Declining is the only honest answer: a machine cannot
        # check off a finding it cannot enumerate. The reviewer's prompt asks
        # for every blocking finding as an inline thread so this is rare, and
        # when it is not, a prose-only round needs Dima's third round instead.
        elif ($raised | length) == 0 then
          {conclusion: "skip", title: "the last round raised no inline thread — findings living only in its comment cannot be checked off by machine"}

        elif $open > 0 then
          {conclusion: "skip", title: "\($open) finding(s) from the last round still carry no reply"}
        elif ($outsiders | length) > 0 then
          {conclusion: "skip", title: "\($outsiders | length) commit(s) in the delta belong to neither the author nor the repo owner"}
        elif ($spent | length) > 0 then
          {conclusion: "skip", title: "these answers already carried a head green once — a set of answers opens exactly one"}
        else
          {conclusion: "success",
           title: "answered on this head",
           summary: "The two-round cap is spent. All \($raised | length) finding(s) the last review raised carry a reply from the author or the repo owner, and every commit pushed since that review belongs to one of them. No reviewer ran on this head — what this green-lights is the answers, not the new code."}
        end
    end)
