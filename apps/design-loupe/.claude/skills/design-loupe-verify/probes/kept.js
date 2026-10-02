// a marker set once on the page: `set` the first call, `kept` while the page never reloaded
(() => {
  if (window.__loupeKept) return 'kept';
  window.__loupeKept = true;
  return 'set';
})();
