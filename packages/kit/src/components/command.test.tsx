import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Command, CommandInput, CommandItem, CommandList } from './command';

const renderCommand = (onSelect = vi.fn()) =>
  render(
    <Command>
      <CommandInput aria-label='search' />
      <CommandList>
        <CommandItem onSelect={onSelect}>bake the scene</CommandItem>
        <CommandItem onSelect={onSelect}>cycle the theme</CommandItem>
      </CommandList>
    </Command>,
  );

test('typing hides the commands that do not match', async () => {
  const screen = await renderCommand();

  await screen.getByRole('combobox', { name: 'search' }).fill('theme');

  await expect
    .element(screen.getByRole('option', { name: 'bake the scene' }))
    .not.toBeInTheDocument();
});

test('enter runs the highlighted command', async () => {
  const onSelect = vi.fn();
  const screen = await renderCommand(onSelect);

  await screen.getByRole('combobox', { name: 'search' }).fill('theme');
  await userEvent.keyboard('{Enter}');

  expect(onSelect).toHaveBeenCalledWith('cycle the theme');
});
