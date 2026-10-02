// where every live board frame stands: `<board> <path>`, and `nested` when one shows design loupe itself
(() =>
  [...document.querySelectorAll('[data-board] iframe')]
    .map((frame) => {
      const doc = frame.contentDocument;
      const board = frame.closest('[data-board]').getAttribute('data-board');
      const nested = doc?.querySelector('aside') ? ' nested' : '';
      return `${board} ${doc?.location.pathname ?? '?'}${nested}`;
    })
    .filter((line) => !line.includes('/boards/') || line.endsWith('nested'))
    .join(' | ') || 'every frame on its board')();
