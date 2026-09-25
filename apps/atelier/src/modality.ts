/** keys that move focus or act on it; typing letters into a field is not keyboard navigation */
const navigationKeys = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter',
  ' ',
  'Escape',
]);

const isTextField = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return Boolean(
    typeof element?.closest === 'function' &&
      (element.isContentEditable ||
        element.closest('input, textarea, [role="combobox"]') !== null),
  );
};

/** «keyboard» or «pointer» for an event: what the last real input was, or null when it says nothing */
export const modalityOf = (event: {
  type: string;
  key?: string;
  target: EventTarget | null;
}): Modality | null => {
  if (event.type === 'pointerdown') return 'pointer';
  if (event.type !== 'keydown' || !event.key) return null;
  if (!navigationKeys.has(event.key)) return null;
  // moving the caret inside a field is still typing; only Tab leaves it
  if (isTextField(event.target) && event.key !== 'Tab') return null;
  return 'keyboard';
};

/**
 * `:focus-visible` alone shows a ring when a click lands in a text field, so
 * the last input is kept on <html> as `data-modality`, and theme.css shows
 * focus rings only after keyboard use.
 */
export const trackModality = () => {
  const root = document.documentElement;
  const handleInput = (event: KeyboardEvent | PointerEvent) => {
    const modality = modalityOf({
      key: 'key' in event ? event.key : undefined,
      target: event.target,
      type: event.type,
    });
    if (modality && root.dataset.modality !== modality)
      root.dataset.modality = modality;
  };
  addEventListener('pointerdown', handleInput, {
    capture: true,
    passive: true,
  });
  addEventListener('keydown', handleInput, { capture: true, passive: true });
};

/* Types */

export type Modality = 'keyboard' | 'pointer';
