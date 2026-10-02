// pinch.mjs <cdp url> <port> <target scale> — pinches over the surface toward a zoom through
// chrome's real input path (CDP Input.dispatchMouseEvent, ctrl = a pinch), never a page script
const [cdpUrl, port, targetArg] = process.argv.slice(2);
const target = Number(targetArg);
if (!(cdpUrl && port && target > 0)) {
  console.error('pinch: <cdp url> <port> <target scale>');
  process.exit(2);
}
const debugPort = new URL(cdpUrl).port;
const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
const page = pages.find(
  (p) => p.type === 'page' && p.url.includes(`localhost:${port}`),
);
if (!page) {
  console.error(`pinch: no page on localhost:${port}`);
  process.exit(2);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve));
let id = 0;
const send = (method, params) =>
  new Promise((resolve) => {
    id += 1;
    const mine = id;
    const onMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== mine) return;
      ws.removeEventListener('message', onMessage);
      resolve(message.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id: mine, method, params }));
  });
const scaleNow = async () =>
  Number(
    (
      await send('Runtime.evaluate', {
        expression:
          "getComputedStyle(document.querySelector('[data-board]').parentElement).getPropertyValue('--zoom')",
        returnByValue: true,
      })
    ).result.value,
  );
// a pinch of px multiplies by 2^(-px / 100), in steps of 10 px
let scale = await scaleNow();
for (
  let step = 0;
  step < 200 && Math.abs(Math.log2(target / scale)) > 0.02;
  step += 1
) {
  const px = Math.max(-10, Math.min(10, -100 * Math.log2(target / scale)));
  // biome-ignore lint/performance/noAwaitInLoops: each pinch reads the scale the previous one left
  await send('Input.dispatchMouseEvent', {
    deltaX: 0,
    deltaY: px,
    modifiers: 2,
    type: 'mouseWheel',
    x: 360,
    y: 300,
  });
  scale = await scaleNow();
}
console.log(scale.toFixed(3));
ws.close();
