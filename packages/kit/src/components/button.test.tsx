import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button } from './button';

/**
 * The first component test in the repo, so it is also the template. Two of the
 * four cases are the reason the kit tests in a real browser rather than a DOM
 * simulator: one reads a colour resolved from the stylesheet, the other needs a
 * pointer that the stylesheet can actually block. A simulator answers an empty
 * string for both, and would pass them against a button with no styles at all.
 */

const TIMED_OUT = /Timeout/;

test('a button is reachable by the name a user reads', async () => {
  const screen = await render(<Button>Save changes</Button>);

  await expect
    .element(screen.getByRole('button', { name: 'Save changes' }))
    .toBeVisible();
});

test('the destructive variant paints the destructive token', async () => {
  const screen = await render(<Button variant='destructive'>Delete</Button>);
  const button = screen.getByRole('button', { name: 'Delete' }).element();

  // Against the token, not against another variant: «these two differ» passes
  // for any two colours, including two wrong ones.
  expect(getComputedStyle(button).color).toBe(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--destructive',
    ),
  );
});

test('a click reaches the handler', async () => {
  const onClick = vi.fn();
  const screen = await render(<Button onClick={onClick}>Run</Button>);

  await screen.getByRole('button', { name: 'Run' }).click();

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('a disabled button cannot be reached by a pointer at all', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button disabled onClick={onClick}>
      Blocked
    </Button>,
  );

  // Deliberately not `force: true`. Forcing bypasses hit-testing, which would
  // prove only the native `disabled` attribute — something every environment
  // honours. The click below times out instead, because
  // `disabled:pointer-events-none` resolved from the stylesheet leaves nothing
  // for a pointer to hit. That is the half only a real browser can show.
  await expect(
    screen.getByRole('button', { name: 'Blocked' }).click({ timeout: 400 }),
  ).rejects.toThrow(TIMED_OUT);

  expect(onClick).not.toHaveBeenCalled();
});
