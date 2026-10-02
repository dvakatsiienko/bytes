// board iframe loads by file, read from resource timing: `<n> boards`, then `<file>×<loads>` for each loaded more than once
(() => {
  const entries = performance.getEntriesByType('resource');
  // chrome keeps 250 entries by default and drops the rest: a full buffer may hide a second load
  if (entries.length >= 250) return `buffer full: ${entries.length} entries`;
  const counts = {};
  for (const entry of entries) {
    if (entry.initiatorType !== 'iframe') continue;
    const file = new URL(entry.name).pathname.split('/').pop();
    counts[file] = (counts[file] ?? 0) + 1;
  }
  const twice = Object.entries(counts)
    .filter(([, loads]) => loads > 1)
    .map(([file, loads]) => `${file}×${loads}`);
  return [`${Object.keys(counts).length} boards`, ...twice].join(' ');
})();
