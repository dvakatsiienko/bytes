import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group';

test('a click on the addon focuses the input', async () => {
  const screen = await render(
    <InputGroup>
      <InputGroupInput aria-label='search' />
      <InputGroupAddon>find</InputGroupAddon>
    </InputGroup>,
  );

  await screen.getByText('find').click();

  await expect
    .element(screen.getByRole('textbox', { name: 'search' }))
    .toHaveFocus();
});
