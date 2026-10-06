# sketchbook

the fleet's prototype surface: a permanent app where one question at a time is answered with a throwaway page, and every answered page is kept.

## Language

### the book

**Frame**:
the stable half of the app — shell, nav, palette, fonts — that survives every proto.
_Avoid_: shell (as the whole), layout, template

**Proto**:
one throwaway page built to answer one question.
_Avoid_: prototype app, mock, demo

**Live proto**:
the one proto being worked on now, in a `current-<topic>` folder.
_Avoid_: active proto, current page

**Question**:
the one thing a proto exists to settle, shown in the header under «answering».
_Avoid_: goal, topic

**Verdict**:
what a proto settled, shown as «settled: …» once it is known.
_Avoid_: result, answer

**Take**:
the page a proto renders when it has one version.
_Avoid_: default view

**Variant**:
one of two or more versions of a proto, each at its own path.
_Avoid_: option, version, tab

### turning pages

**Shift**:
archiving the live proto under the next number and starting a blank one.
_Avoid_: rotate, reset, move

**Page**:
an archived proto, numbered `NNN-<topic>`, still openable to compare.
_Avoid_: archive entry, old proto

**Bench**:
a set of lanes that answer the same brief side by side, for judging.
_Avoid_: comparison, contest

**Lane**:
one entry on a bench, at `/bench/<lane>`, shown without the frame's header so nothing biases the judging.
_Avoid_: track, entry

### the board

**Ticket strip**:
the row of ticket chips under the header, grouped as in progress, done and touched.
_Avoid_: ticket bar, status row

**State panel**:
the «state» box that shows a proto's whole state, live, so a wrong state model is seen, not guessed.
_Avoid_: debugger, inspector
