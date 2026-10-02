// the pointer-events of the one live board's frame, `none` when no board is live
(() => {
  const live = document.querySelector('.loupe-board-live iframe');
  return live ? getComputedStyle(live).pointerEvents : 'none';
})();
