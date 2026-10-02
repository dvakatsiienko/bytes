# design-loupe

Where the designer's questions reach dima: each one pinned to an element on a live board, answered in place.

## Language

**Job**:
One app being designed in studio (`studio/jobs/<app>/`); its boards and asks belong to it.
_Avoid_: project, canvas (as the general word)

**Board**:
One artboard of a job, a `.dc.html` file, rendered live from the studio files.
_Avoid_: frame, screen, comp

**Ask**:
One question from the designer to dima, pinned to an element on a board: a pick, a confirm, a compare or an open question, with a recommendation.
_Avoid_: comment, question (as the record), ballot

**Pin**:
The element an ask points at, marked `id="ask-N"` in its board; the id comes off when the ask is applied.
_Avoid_: anchor, marker

**Round**:
The set of asks the designer writes at once; dima gets one push per round.
_Avoid_: batch, phase

**Answer**:
dima's reply to one ask — the option he picked plus a thread of notes — written to `answers.json` with the ask id and the board revision. A note never clears the pick.
_Avoid_: vote, verdict

**Note**:
One line dima adds to an ask's answer, with its time; notes stack oldest first and none is ever overwritten, a reopen included.
_Avoid_: comment, message

**Ask states**:
open → answered → seen (the designer read it) → applied (its board changed); any ask can be reopened.

**Ring**:
The highlight design-loupe draws over a pinned element when a deep link opens it; drawn by the app, never injected into the board.
_Avoid_: focus ring, outline

**Target moved**:
The state of an ask whose pin is gone from its board's current revision.
_Avoid_: broken, stale (alone)
