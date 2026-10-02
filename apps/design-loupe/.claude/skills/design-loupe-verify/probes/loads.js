// board iframe loads by file, read from resource timing: `<n> boards`, then `<file>×<loads>` for each loaded more than once
(() => {
  const counts = {};
  for (const entry of performance.getEntriesByType('resource')) {
    if (entry.initiatorType !== 'iframe') continue;
    const file = new URL(entry.name).pathname.split('/').pop();
    counts[file] = (counts[file] ?? 0) + 1;
  }
  const twice = Object.entries(counts)
    .filter(([, loads]) => loads > 1)
    .map(([file, loads]) => `${file}×${loads}`);
  return [`${Object.keys(counts).length} boards`, ...twice].join(' ');
})();
