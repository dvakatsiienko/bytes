import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable';

test('an arrow key on the handle widens the panel before it', async () => {
  const screen = await render(
    <div style={{ width: 400, height: 100 }}>
      <ResizablePanelGroup orientation='horizontal'>
        <ResizablePanel defaultSize='50%' id='rail'>
          rail
        </ResizablePanel>
        <ResizableHandle aria-label='resize rail' />
        <ResizablePanel defaultSize='50%' id='canvas'>
          canvas
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>,
  );
  const rail = screen.getByText('rail').element();
  const before = rail.getBoundingClientRect().width;

  await userEvent.click(screen.getByRole('separator'));
  await userEvent.keyboard('{ArrowRight}');

  expect(rail.getBoundingClientRect().width).toBeGreaterThan(before);
});
