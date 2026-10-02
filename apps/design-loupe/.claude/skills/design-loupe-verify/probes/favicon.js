// the count drawn on the favicon, 0 when it has none
(() => {
  const svg = decodeURIComponent(
    document.querySelector('link[rel=icon]').href.split(',')[1] ?? '',
  );
  const [, text] = svg.split('<text');
  return text ? text.slice(text.indexOf('>') + 1, text.indexOf('<')) : '0';
})();
