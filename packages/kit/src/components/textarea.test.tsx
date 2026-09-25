import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Textarea } from './textarea';

test('the textarea grows with its content', async () => {
  const screen = await render(<Textarea aria-label='why it is good' />);
  const field = screen.getByRole('textbox', { name: 'why it is good' });
  const empty = field.element().getBoundingClientRect().height;

  await field.fill('one\ntwo\nthree\nfour\nfive\nsix');

  expect(field.element().getBoundingClientRect().height).toBeGreaterThan(empty);
});
