// the board probes/board-link.js clicked: `kept` when its window never reloaded, `reloaded` when it did
(() => {
  const frame = window.__boardLinkFrame;
  if (!frame) return 'no clicked board';
  return frame.contentWindow?.__boardKept ? 'kept' : 'reloaded';
})();
