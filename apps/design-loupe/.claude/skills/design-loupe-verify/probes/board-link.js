// marks the live board's own window, then clicks its first link; probes/board-kept.js reads the mark
// after — a frame that navigated (and was sent back) is a new window and has lost it
(() => {
  const frame = document.querySelector('.loupe-board-live iframe');
  const link = frame?.contentDocument.querySelector('a[href]');
  if (!link) return 'no live board link';
  frame.contentWindow.__boardKept = true;
  window.__boardLinkFrame = frame;
  link.click();
  return `clicked ${link.getAttribute('href')}`;
})();
