import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';

test('a right click opens the menu', async () => {
  const screen = await render(
    <ContextMenu>
      <ContextMenuTrigger>take 03</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>promote</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );

  await screen.getByText('take 03').click({ button: 'right' });

  await expect
    .element(screen.getByRole('menuitem', { name: 'promote' }))
    .toBeVisible();
});

test('a menu item runs its action', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <ContextMenu>
      <ContextMenuTrigger>take 03</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onClick}>promote</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );

  await screen.getByText('take 03').click({ button: 'right' });
  await screen.getByRole('menuitem', { name: 'promote' }).click();

  expect(onClick).toHaveBeenCalledTimes(1);
});
