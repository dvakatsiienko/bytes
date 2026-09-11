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

// Case-insensitive: the assertion should survive playwright rewording its own
// error, which is prose, not contract.
const TIMED_OUT = /timeout/i;

test('a button is reachable by the name a user reads', async () => {
  const screen = await render(<Button>Save changes</Button>);

  await expect
    .element(screen.getByRole('button', { name: 'Save changes' }))
    .toBeVisible();
});

test('the destructive variant paints the destructive token', async () => {
  const screen = await render(
    <>
      <Button variant='destructive'>Delete</Button>
      {/* The same token, resolved by the browser rather than read as text. */}
      <span data-testid='token' style={{ color: 'var(--destructive)' }} />
    </>,
  );

  const button = screen.getByRole('button', { name: 'Delete' }).element();
  const token = screen.getByTestId('token').element();

  // Against the token, not against another variant: «these two differ» passes
  // for any two colours, including two wrong ones. And against a RESOLVED
  // token, not the raw text of the custom property: `color` is serialized by
  // the browser while `getPropertyValue` returns whatever `globals.css` was
  // authored with, so re-writing that colour as a hex would fail this test with
  // nothing wrong. The probe span puts both sides through one serializer.
  expect(getComputedStyle(button).color).toBe(getComputedStyle(token).color);
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
