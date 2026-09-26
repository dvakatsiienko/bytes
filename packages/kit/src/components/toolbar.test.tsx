import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Toolbar, ToolbarButton } from './toolbar';

test('a toolbar is one tab stop and the arrows move inside it', async () => {
  const screen = await render(
    <>
      <Toolbar aria-label='zoom'>
        <ToolbarButton>in</ToolbarButton>
        <ToolbarButton>out</ToolbarButton>
      </Toolbar>
      <button type='button'>after</button>
    </>,
  );

  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByText('in').element());
  await userEvent.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(screen.getByText('out').element());
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByText('after').element());
});
