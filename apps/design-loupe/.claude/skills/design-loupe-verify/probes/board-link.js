// clicks the first link inside the live board; the caller reads probes/board-page.js a moment later
(() => {
  const frame = document.querySelector('.loupe-board-live iframe');
  const link = frame?.contentDocument.querySelector('a[href]');
  if (!link) return 'no live board link';
  link.click();
  return `clicked ${link.getAttribute('href')}`;
})();
