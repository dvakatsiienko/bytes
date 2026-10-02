// one Esc keydown inside the live board's own window, where a focused board hears it
(() => {
  const live = document.querySelector('.loupe-board-live iframe');
  live?.contentWindow.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape' }),
  );
  return live ? 'sent' : 'no live board';
})();
