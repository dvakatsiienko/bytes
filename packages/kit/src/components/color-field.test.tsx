import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { ColorField } from './color-field';

const Harness = (props: { onValueChange: (value: string) => void }) => {
  const [value, setValue] = useState('#ffffff');
  return (
    <ColorField
      aria-label='sun tint'
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange(next);
      }}
      value={value}
    />
  );
};

test('a picked colour is reported as hex', async () => {
  const onValueChange = vi.fn();
  const screen = await render(<Harness onValueChange={onValueChange} />);

  await screen.getByLabelText('sun tint').fill('#ffd978');

  expect(onValueChange).toHaveBeenLastCalledWith('#ffd978');
});

test('the hex of the current colour is shown beside the well', async () => {
  const screen = await render(<Harness onValueChange={vi.fn()} />);

  await screen.getByLabelText('sun tint').fill('#c8553d');

  await expect.element(screen.getByText('#c8553d')).toBeVisible();
});
