// the ask-1 row link's box and what the pointer hits at its centre and corners
(() => {
  const link = document.querySelector('a[href$="#ask-1"]');
  const r = link.getBoundingClientRect();
  const hit = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el
      ? `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`
      : 'none';
  };
  return JSON.stringify({
    box: [r.left, r.top, r.width, r.height].map(Math.round),
    centre: hit(r.left + r.width / 2, r.top + r.height / 2),
    inLink: link.contains(
      document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2),
    ),
    topLeft: hit(r.left + 2, r.top + 2),
  });
})();
