import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button } from './button';

/**
 * The first component test in the repo, so it is also the template. Two of the
 * five cases are the reason the kit tests in a real browser rather than a DOM
 * simulator: both read a value resolved from the stylesheet, and a simulator
 * answers an empty string for each — passing against a button with no styles at
 * all. The other three would run anywhere, and are here because they are the
 * button's behaviour.
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

test('a disabled button never calls its handler', async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button disabled onClick={onClick}>
      Blocked
    </Button>,
  );

  // Not `force: true`: forcing bypasses hit-testing, and the question here is
  // whether a real pointer can land at all.
  await expect(
    screen.getByRole('button', { name: 'Blocked' }).click({ timeout: 400 }),
  ).rejects.toThrow(TIMED_OUT);

  expect(onClick).not.toHaveBeenCalled();
});

test('the stylesheet takes a disabled button out of hit-testing', async () => {
  const screen = await render(<Button disabled>Blocked</Button>);
  const button = screen.getByRole('button', { name: 'Blocked' }).element();

  // This needs its own assertion, and the test above cannot stand in for it.
  // Measured: a disabled button with `pointer-events` forced back on still
  // times out, because the click waits on the native `disabled` attribute. So
  // deleting `disabled:pointer-events-none` would leave that test green and
  // this one red, which is the right way round.
  expect(getComputedStyle(button).pointerEvents).toBe('none');
});
