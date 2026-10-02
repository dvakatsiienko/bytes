// the open ask's question: plain selectable text outside every link, `plain` or what is wrong
(() => {
  const row = document.querySelector('aside li.border-loupe');
  const question = row?.querySelector('p.select-text');
  if (!question) return 'no open question';
  if (question.closest('a')) return 'inside a link';
  const select = getComputedStyle(question).userSelect;
  if (select === 'none') return 'not selectable';
  const jumps = row.querySelectorAll('a[href*="/ask/"]').length;
  return `plain, ${jumps} jump links`;
})();
