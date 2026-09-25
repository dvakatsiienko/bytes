import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Popover, PopoverContent, PopoverTrigger } from './popover';

const renderPopover = () =>
  render(
    <Popover>
      <PopoverTrigger>stash</PopoverTrigger>
      <PopoverContent>why it is good</PopoverContent>
    </Popover>,
  );

test('the trigger opens the popover', async () => {
  const screen = await renderPopover();

  await screen.getByRole('button', { name: 'stash' }).click();

  await expect.element(screen.getByText('why it is good')).toBeVisible();
});

test('escape closes the popover', async () => {
  const screen = await renderPopover();

  await screen.getByRole('button', { name: 'stash' }).click();
  await expect.element(screen.getByText('why it is good')).toBeVisible();
  await userEvent.keyboard('{Escape}');

  await expect
    .element(screen.getByText('why it is good'))
    .not.toBeInTheDocument();
});
