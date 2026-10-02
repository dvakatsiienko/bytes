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
The set of asks the designer writes at once; dima gets one push per round, and the designer gets the answers back in handovers.
_Avoid_: batch, phase

**Handover**:
The moment a round's answers go back to the designer, all at once: by itself when the last open ask is answered, or early when dima presses «send to designer». A pick or a note after a handover waits for the next one.
_Avoid_: submit, push (the push is the designer's call to dima)

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
The state of an ask whose pin is gone from its board's current revision. The ask is locked until the designer pins it again: it takes no answer and is left out of every count and handover.
_Avoid_: broken, stale (alone)
