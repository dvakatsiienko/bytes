import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './dialog';

const renderDialog = () =>
  render(
    <Dialog>
      <DialogTrigger>zoom</DialogTrigger>
      <DialogContent>
        <DialogTitle>homestead · day</DialogTitle>
      </DialogContent>
    </Dialog>,
  );

test('the trigger opens a dialog named by its title', async () => {
  const screen = await renderDialog();

  await screen.getByRole('button', { name: 'zoom' }).click();

  await expect
    .element(screen.getByRole('dialog', { name: 'homestead · day' }))
    .toBeVisible();
});

test('escape closes the dialog', async () => {
  const screen = await renderDialog();

  await screen.getByRole('button', { name: 'zoom' }).click();
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});

test('the close button closes the dialog', async () => {
  const screen = await renderDialog();

  await screen.getByRole('button', { name: 'zoom' }).click();
  await screen.getByRole('button', { name: 'Close' }).click();

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
});
