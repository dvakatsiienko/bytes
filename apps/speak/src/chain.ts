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
