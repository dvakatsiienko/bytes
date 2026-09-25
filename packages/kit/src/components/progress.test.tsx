import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Progress } from './progress';

test('the value is announced on a progressbar', async () => {
  const screen = await render(<Progress aria-label='sheets' value={40} />);

  await expect
    .element(screen.getByRole('progressbar', { name: 'sheets' }))
    .toHaveAttribute('aria-valuenow', '40');
});

test('the bar fills in proportion to the value', async () => {
  const screen = await render(
    <div style={{ width: 200 }}>
      <Progress aria-label='sheets' value={25} />
    </div>,
  );
  const indicator = screen
    .getByRole('progressbar')
    .element()
    .querySelector('[data-slot=progress-indicator]');

  expect(indicator?.getBoundingClientRect().width).toBeCloseTo(50, 0);
});
