import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ScrollArea } from './scroll-area';

test('tall content scrolls inside the area', async () => {
  const screen = await render(
    <ScrollArea style={{ height: 100 }}>
      <div style={{ height: 1000 }}>takes</div>
    </ScrollArea>,
  );
  const viewport = screen
    .getByText('takes')
    .element()
    .closest<HTMLElement>('[data-slot=scroll-area-viewport]');
  if (!viewport) throw new Error('no viewport');

  await userEvent.hover(viewport);
  viewport.scrollTop = 300;

  expect(viewport.scrollTop).toBe(300);
  expect(viewport.getBoundingClientRect().height).toBe(100);
});
