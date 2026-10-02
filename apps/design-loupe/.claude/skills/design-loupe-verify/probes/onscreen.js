// the board of the focused element, whole on the surface or cut: `whole <board>` / `cut <board> …`
(() => {
  const board = document.activeElement?.closest('[data-board]');
  if (!board) return 'no focused board';
  const s = document
    .querySelector('.react-transform-wrapper')
    .getBoundingClientRect();
  const b = board.getBoundingClientRect();
  const isWhole =
    b.left >= s.left &&
    b.right <= s.right &&
    b.top >= s.top &&
    b.bottom <= s.bottom;
  const name = board.getAttribute('data-board');
  return isWhole
    ? `whole ${name}`
    : `cut ${name} ${[b.left, b.right, s.right].map(Math.round).join(' ')}`;
})();
