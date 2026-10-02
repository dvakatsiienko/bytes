// tab.mjs <cdp url> <port> <css selector> — real Tab presses through CDP Input until the focus lands on
// the selector (40 at most); prints the count. `agent-browser press` sends ~480 keydowns, so never that.
const [cdpUrl, port, selector] = process.argv.slice(2);
if (!(cdpUrl && port && selector)) {
  console.error('tab: <cdp url> <port> <css selector>');
  process.exit(2);
}
const debugPort = new URL(cdpUrl).port;
const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
const page = pages.find(
  (p) => p.type === 'page' && p.url.includes(`localhost:${port}`),
);
if (!page) {
  console.error(`tab: no page on localhost:${port}`);
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
const isThere = async () =>
  (
    await send('Runtime.evaluate', {
      expression: `document.activeElement?.matches(${JSON.stringify(selector)}) ?? false`,
      returnByValue: true,
    })
  ).result.value;
const tab = { code: 'Tab', key: 'Tab', windowsVirtualKeyCode: 9 };
let count = 0;
// biome-ignore lint/performance/noAwaitInLoops: each press moves the focus the next check reads
while (count < 40 && !(await isThere())) {
  await send('Input.dispatchKeyEvent', { ...tab, type: 'keyDown' });
  await send('Input.dispatchKeyEvent', { ...tab, type: 'keyUp' });
  count += 1;
}
console.log((await isThere()) ? String(count) : 'missed');
ws.close();
