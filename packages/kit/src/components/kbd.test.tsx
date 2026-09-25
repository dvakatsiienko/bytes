import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Kbd } from './kbd';

test('a key renders as keyboard input', async () => {
  const screen = await render(<Kbd>⌘K</Kbd>);

  expect(screen.getByText('⌘K').element().tagName).toBe('KBD');
});
