# The review gate's decision, as a pure function of what the api returned.
#
# It lives in a file rather than inside review.yml for two reasons. The two
# callers below read the same two things — what the reviewer concluded, and
# whether its findings carry replies — and a second copy of that predicate is
# how the two would drift. And a decision embedded in a workflow can only be
# exercised by spending a review round on a real PR, whereas this one is fed
# saved payloads by `.github/scripts/review-cases.sh`, which is what proves a
# findings round goes red without waiting for a findings round to happen.
#
#   $mode == "round"     the guard that judges a review round
#   $mode == "answered"  the post-cap answer check
#
# Input  { artifacts, threads, commits }
#          artifacts  every comment/review the run may have written, folded
#          threads    pulls/N/comments — the inline finding threads
#          commits    "answered" only: the commits pushed since the last review
# Args   mode who author owner since run
#          who     the reviewer app, `<slug>[bot]`
#          author  the PR's own author — the only bot whose reply clears a finding
#          owner   the repo owner, who is the other account allowed to push here
#          since   the moment the round started ("round") or the last round's
#                  run creation time ("answered")
#          run     the job-run url the round wrote into its own comment
# Output { conclusion, title, summary, standdown, posted, verdict, open }
#          conclusion  "success" | "failure" | "skip"  ("skip" is answered-only:
#                      publish nothing, leave the head without a check)
#          standdown   the action refused itself and no reviewer was spent, so
#                      the round must not count against the cap

# The round's own artifacts. The author test alone is not enough: `use_sticky_comment`
# reuses an existing tracking comment, and an edit does not change a comment's
# author — a comment first written by `claude[bot]` still reads as `claude[bot]`
# after the reviewer writes its verdict into it. The job-run link is the
# author-independent handle; the action writes it into that comment whoever owns it.
def ours: select((.user.login == $who) or ((.body // "") | contains($run)));

# Freshness, not creation: an edit moves `updated_at` and leaves `created_at` at
# the round that first created the comment.
def touched: select(((.updated_at // .submitted_at // "") > $since));

# A reply that clears a finding. A HUMAN reply always counts; a BOT reply counts
# only from the PR's own author, so a third-party review bot cannot clear a
# finding by answering a thread it does not own.
def answerer: select(.user.login != $who and (.user.type != "Bot" or .user.login == $author));

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
          answered: ([$all[] | answerer | select((.in_reply_to_id // .id) == $root)] | length > 0)})
   | map(select(.answered | not))) as $unanswered
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
         summary: (if $open > 0 then "Unanswered on this head:\n\($openlist)\n\n" else "" end)
                  + "Fix what it found, or answer each finding with a reason, then re-apply the label."}
      elif $open > 0 then
        {conclusion: "failure",
         title: "\($open) finding(s) with no reply",
         summary: "\($openlist)\n\nFix them, or answer each thread with a reason, then re-apply the label."}
      else
        {conclusion: "success",
         title: "clean on this head",
         summary: "The reviewer posted \($posted) artifact(s) on this head, said `verdict: clean`, and every finding it raised has a reply."}
      end
    else
      # The post-cap answer check. It publishes a green or it publishes nothing:
      # a red here would paint every ordinary mid-work push as a failure, and the
      # designed default for a head nobody reviewed is already a blocked merge.
      ([$in.commits // [] | .[]
        | select((.author.login // "") != $author and (.author.login // "") != $owner)]) as $outsiders
      | (([$in.artifacts // [] | .[], $all[]]
          | map(answerer | select((.created_at // "") > $since))
          | length) > 0) as $spoke
      | if $posted == 0 then
          {conclusion: "skip", title: "the last round left no readable artifact"}
        elif $verdict != "findings" then
          {conclusion: "skip", title: "the last round's verdict was \($verdict // "absent") — only a findings round can be answered"}
        elif $open > 0 then
          {conclusion: "skip", title: "\($open) finding(s) from the last round still carry no reply"}
        elif ($spoke | not) then
          {conclusion: "skip", title: "no answer from the author since the last round"}
        elif ($outsiders | length) > 0 then
          {conclusion: "skip", title: "\($outsiders | length) commit(s) in the delta are not the author's"}
        else
          {conclusion: "success",
           title: "answered on this head",
           summary: "The two-round cap is spent. Every finding of the last review carries a reply, the author answered on the PR, and every commit pushed since that review is the author's own. No reviewer ran on this head — what it green-lights is the answers, not the new code."}
        end
    end)
