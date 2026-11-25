// the languages' chains through a drag, as a pure step; App runs it
import { move } from '@dnd-kit/helpers';

import type { Config, Engine } from '@/api.ts';

export const chainAfterDrag = (
  chain: Config['chain'],
  event: Parameters<typeof move>[1],
): Config['chain'] => {
  const before = Object.fromEntries(
    Object.entries(chain).map(([lang, engines]) => [
      lang,
      engines.map((engine) => `${lang}:${engine}`),
    ]),
  );
  const after = move(before, event);
  // a card stays in its column: one carried into another's changes two lengths
  if (
    Object.keys(before).some(
      (lang) => after[lang]?.length !== before[lang]?.length,
    )
  )
    return chain;
  return Object.fromEntries(
    Object.entries(after).map(([lang, ids]) => [
      lang,
      ids.map((id) => id.slice(lang.length + 1) as Engine),
    ]),
  );
};

// the order moves while the card is carried, so a card that left its column has left a trace there: such a drop
// puts the column back, as a cancel does
export const isDropUndone = (event: Drop, columnUnderPointer?: string) => {
  const { activatorEvent, source, target } = event.operation;
  if (event.canceled) return true;
  // a key moves among its own cards alone, and its point does not scroll with the page
  if (activatorEvent?.type === 'keydown') return false;
  return columnUnderPointer
    ? !String(source?.id).startsWith(`${columnUnderPointer}:`)
    : !target;
};

/* Types */
interface Drop {
  canceled: boolean;
  operation: {
    activatorEvent?: { type: string } | null;
    source: { id: string | number } | null;
    target: { id: string | number } | null;
  };
}
