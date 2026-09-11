import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button } from './button';

/**
 * The first component test, and the reason the kit tests in a real browser.
 * Every case here is something a DOM simulator reports wrongly: a stylesheet it
 * never applies, and a `pointer-events: none` it does not honour. In jsdom all
 * three would pass against a broken button.
 */

test('a button is reachable by the name a user reads', async () => {
  const screen = await render(<Button>Save changes</Button>);

  await expect
    .element(screen.getByRole('button', { name: 'Save changes' }))
    .toBeVisible();
});

test('the destructive variant is a different colour, not just a different class', async () => {
  const screen = await render(
    <>
      <Button>Keep</Button>
      <Button variant='destructive'>Delete</Button>
    </>,
  );

  const keep = screen.getByRole('button', { name: 'Keep' }).element();
  const destroy = screen.getByRole('button', { name: 'Delete' }).element();

  // The class name is the implementation; the rendered colour is the contract,
  // and it is what a broken token or a dropped stylesheet actually costs.
  expect(getComputedStyle(destroy).color).not.toBe(
    getComputedStyle(keep).color,
  );
});

test('a click reaches the handler, and a disabled button swallows it', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <>
      <Button onClick={onClick}>Run</Button>
      <Button disabled onClick={onClick}>
        Blocked
      </Button>
    </>,
  );

  await screen.getByRole('button', { name: 'Run' }).click();
  expect(onClick).toHaveBeenCalledTimes(1);

  // The disabled button is unreachable twice over, and only one of the two is
  // visible here: a native `disabled` attribute, which any environment honours,
  // and `disabled:pointer-events-none` resolved from the stylesheet, which a
  // DOM simulator reports as an empty string. `force` is required precisely
  // because the second one is real.
  const blocked = screen.getByRole('button', { name: 'Blocked' });
  expect(getComputedStyle(blocked.element()).pointerEvents).toBe('none');

  await blocked.click({ force: true });
  expect(onClick).toHaveBeenCalledTimes(1);
});
