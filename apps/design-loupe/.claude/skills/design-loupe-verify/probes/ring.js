// the ring's box against the pin's box, both in screen px: `scale=<zoom> delta=<worst edge gap>`
(() => {
  const ring = document.querySelector('[data-ring]');
  if (!ring) return 'no-ring';
  const frame = ring.parentElement.querySelector('iframe');
  const pin = frame.contentDocument.getElementById(
    ring.getAttribute('data-ring'),
  );
  if (!pin) return 'no-pin';
  const f = frame.getBoundingClientRect();
  const scale = f.width / frame.offsetWidth;
  const p = pin.getBoundingClientRect();
  const r = ring.getBoundingClientRect();
  const delta = Math.max(
    Math.abs(r.left - (f.left + p.left * scale)),
    Math.abs(r.top - (f.top + p.top * scale)),
    Math.abs(r.right - (f.left + p.right * scale)),
    Math.abs(r.bottom - (f.top + p.bottom * scale)),
  );
  return `scale=${scale.toFixed(3)} delta=${delta.toFixed(2)}`;
})();
