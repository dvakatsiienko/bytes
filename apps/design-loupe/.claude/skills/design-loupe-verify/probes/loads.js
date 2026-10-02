// board iframe loads by file and revision, read from resource timing: `<n> boards`, then `<file>?rev=<rev>×<loads>`
// for each revision loaded more than once — a new revision of a board is a new load, on purpose
(() => {
  const entries = performance.getEntriesByType('resource');
  // chrome keeps 250 entries by default and drops the rest: a full buffer may hide a second load
  if (entries.length >= 250) return `buffer full: ${entries.length} entries`;
  const counts = {};
  for (const entry of entries) {
    if (entry.initiatorType !== 'iframe') continue;
    const url = new URL(entry.name);
    const file = `${url.pathname.split('/').pop()}${url.search}`;
    counts[file] = (counts[file] ?? 0) + 1;
  }
  const twice = Object.entries(counts)
    .filter(([, loads]) => loads > 1)
    .map(([file, loads]) => `${file}×${loads}`);
  return [`${Object.keys(counts).length} boards`, ...twice].join(' ');
})();
