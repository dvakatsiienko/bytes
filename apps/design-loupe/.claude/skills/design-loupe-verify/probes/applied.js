// the href of the «applied in vN» link in the open ask
(() => {
  const link = [...document.querySelectorAll('aside a')].find((a) =>
    a.textContent.startsWith('v'),
  );
  return link ? link.getAttribute('href') : 'none';
})();
