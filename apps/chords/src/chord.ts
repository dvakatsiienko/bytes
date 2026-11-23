// A chord's rule — which modifier comes first — lives in frame's daemon and travels with the bindings
// answer: every row arrives with its chord spelled, and `modifierOrder` beside them. Nothing here sorts
// on its own.

/** A layer and a key joined. Both already stand in the daemon's order; a key with no binding has no row to read it off. */
export const joinChord = (layer: string, key: string) =>
  layer === '' ? key : `${layer}+${key}`;

// A typed filter query, spelled the way the daemon spells a chord. dima reaches for the modifiers
// in whatever order his hand finds them, so `cmd+shift+l` has to match the canonical
// `shift+cmd+l`. Tokens the order knows are sorted into it; anything else keeps its place behind
// them, which is what lets a query that is not a chord at all pass through unchanged and still
// match a note's prose.
export const canonicalQuery = (
  text: string,
  modifierOrder: readonly string[],
) => {
  const parts = text.split('+').filter(Boolean);
  const mods = parts
    .filter((part) => modifierOrder.includes(part))
    .sort((a, z) => modifierOrder.indexOf(a) - modifierOrder.indexOf(z));
  const rest = parts.filter((part) => !modifierOrder.includes(part));

  return [...mods, ...rest].join('+');
};

// The chord a press stream update is about. One 2s tick can move a real chord and a bare
// modifier pressed on its own right after; the real chord wins, or a rebind hears only the
// modifier and drops the press. (The daemon no longer logs a chord's own release as bare.)
export const pressedChord = (
  previous: Record<string, number>,
  counts: Record<string, number>,
) => {
  const moved = Object.keys(counts).filter(
    (chord) => (counts[chord] ?? 0) > (previous[chord] ?? 0),
  );

  return moved.find((chord) => chord.includes('+')) ?? moved[0];
};
