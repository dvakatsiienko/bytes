import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Switch } from './switch';

test('a click turns the switch on', async () => {
  const screen = await render(<Switch aria-label='haze' />);
  const toggle = screen.getByRole('switch', { name: 'haze' });

  await toggle.click();

  await expect.element(toggle).toBeChecked();
});
