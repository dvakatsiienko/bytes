// Enter on a focused ask link must follow the link, never answer the open ask: focuses the ask-2 row
// and sends one Enter keydown from it; the caller reads answers.json after
(() => {
  const link = document.querySelector('a[href$="#ask-2"]');
  link.focus();
  link.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
  );
  return document.activeElement === link
    ? 'sent from the ask-2 link'
    : 'focus missed';
})();
