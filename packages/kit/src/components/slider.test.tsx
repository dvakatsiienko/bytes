import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Slider } from './slider';

test('an arrow key moves the value by one step', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Slider
      aria-label='exposure'
      defaultValue={[50]}
      max={100}
      min={0}
      onValueChange={onValueChange}
      step={5}
    />,
  );

  // The slider's input is visually hidden inside the thumb; tab reaches it the
  // way a keyboard user does.
  await userEvent.tab();
  await expect.element(screen.getByRole('slider')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');

  expect(onValueChange).toHaveBeenLastCalledWith([55], expect.anything());
});

test('a single number draws a single thumb', async () => {
  const screen = await render(
    <Slider aria-label='exposure' max={100} min={0} value={40} />,
  );

  expect(screen.getByRole('slider').elements()).toHaveLength(1);
});
