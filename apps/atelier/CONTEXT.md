# atelier

The fleet's art studio: every picture is drawn as code, looked at, revised, and kept as takes until one ships.

## Language

### what gets drawn

**Piece**:
One drawing atelier knows by name, registered once; everything in the studio happens to a piece.
_Avoid_: artwork, asset, image, scene (as the general word)

**Kind**:
What a piece is for: a scene, a spot, an icon, an avatar, a badge or a favicon.
_Avoid_: type, category

**Scene**:
A kind: a wide illustration, usually a readme hero. A scene may be lit or flat.
_Avoid_: using «scene» for any piece

**Lit piece**:
A piece drawn on the stage as paper sheets under a sun, so light, lens and paper settings reach it.
_Avoid_: 3d piece, stage scene

**Flat piece**:
A piece that ships as its own svg; only its seed can change.
_Avoid_: 2d piece, static piece

**Stage**:
The lit room a lit piece is drawn in: its sheets, its sun, its lens.
_Avoid_: canvas, renderer, viewport

**Sheet**:
One paper layer of a lit piece, set at its own depth on the stage.
_Avoid_: layer (in talk with dima), plane

**Settings**:
The values that shape how a piece looks right now: its seed and look, and the light, lens, atmosphere and toggles on the ring.
_Avoid_: params, config, controls

**Seed**:
The number that makes a piece's scatter reproducible: the same seed draws the same piece.

**Time**:
Day or night; a piece is drawn, baked and shipped for each.
_Avoid_: mode, theme (theme is the studio's own light or dark)

**Motion**:
The six-second loop a piece that moves can play: wind in the bunting, fireflies, smoke.
_Avoid_: animation, autoplay

### what gets kept

**Bake**:
To render the piece as it looks now, at one time of day, into a new take.
_Avoid_: export, render, snapshot, build

**Take**:
One kept result of a bake: the image, the settings and seed that made it, and a note.
_Avoid_: version, render, snapshot, variant

**Motion loop**:
A take that holds the whole motion as a looping animated image instead of one frame.
_Avoid_: gif, video

**Note**:
One line on a take saying what it tries.
_Avoid_: description, comment, label

**Current take**:
The take that ships for a piece at one time of day; each piece has at most one per time.
_Avoid_: active take, main take, selected take

**Promote**:
To make a take the current take for its time of day.
_Avoid_: publish, select, pick

**Stash**:
To set a good take aside for a later job, with what is good about it and why it does not fit yet. A stashed take is never deleted.
_Avoid_: archive, discard, trash

**Ship**:
To copy every current take into the repos whose readmes show it.
_Avoid_: publish, deploy, export

### how dima looks at it

**Live view**:
The piece as it looks now, redrawn as settings or the drawing change.
_Avoid_: editor, preview, canvas

**Ring**:
The four edges around the piece, each holding one group of settings; one edge is open at a time.
_Avoid_: sidebar, panel, drawer

**Edge**:
One side of the ring and its group: light on top, lens on the right, atmosphere at the bottom, toggles on the left. Folded it is a chip; open it holds every setting of its group.
_Avoid_: tab (except in the narrow layout, where the edges become tabs), drawer

**Corner**:
One of the four cards at the screen's corners: the piece corner (top left), the view corner (top right), the takes corner (bottom left), the tools corner with the bake (bottom right).
_Avoid_: widget, panel

**Ground**:
What the piece sits on: by day light or dark by the studio theme, at night always dark. A flat piece sits on the plain ground at a whole zoom.
_Avoid_: stage (the lit room), background, canvas

**Takes stack**:
The newest takes stacked in the bottom-left corner, the shown one in front.
_Avoid_: pile, deck

**Film strip**:
The takes in a row along the bottom edge, opened from the takes stack; it counts as the bottom edge, so it and an open edge never show together.
_Avoid_: gallery, carousel, takes list

**Pixel view**:
A favicon drawn at the size it lands at (16, 32 or 64 px), enlarged by a whole zoom, one square per pixel, with a grid from 8×.
_Avoid_: magnifier, loupe

**Readme frame**:
The live view wrapped in github's page at phone or desktop width, so a piece is judged where it will be seen.
_Avoid_: preview, mockup

**Compare**:
Two takes of one piece side by side, or under one sliding divider.
_Avoid_: diff

**Section**:
One region of the studio screen that fails alone: the view corner (header), the piece corner (pieces), the takes corner (takes), the tools corner (toolbar), the piece (viewport), the ring (panel).
_Avoid_: pane, widget
