// which board fills the surface, and whether a ring shows: `whole <board> no-ring`
(() => {
  const surface = document
    .querySelector('.react-transform-wrapper')
    .getBoundingClientRect();
  const inside = [...document.querySelectorAll('[data-board]')].filter(
    (board) => {
      const b = board.getBoundingClientRect();
      const isInside =
        b.left >= surface.left &&
        b.right <= surface.right &&
        b.top >= surface.top &&
        b.bottom <= surface.bottom;
      // framed = it fills the surface along its tighter side; a tall board fills the height
      return (
        isInside &&
        (b.width > surface.width * 0.8 || b.height > surface.height * 0.8)
      );
    },
  );
  const ring = document.querySelector('[data-ring]') ? 'ring' : 'no-ring';
  return inside.length === 1
    ? `whole ${inside[0].getAttribute('data-board')} ${ring}`
    : `framed ${inside.length} boards ${ring}`;
})();
