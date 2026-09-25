import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { NumberField } from './number-field';

/**
 * The field is controlled, so every test mounts it with real state: a spy
 * alone would show what was reported, not what the field then displays.
 */
const renderField = async (props: { max?: number; step?: number } = {}) => {
  const onValueChange = vi.fn();
  function Harness() {
    const [value, setValue] = useState(0.6);
    return (
      <NumberField
        aria-label='ambient'
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
        step={0.01}
        value={value}
        {...props}
      />
    );
  }
  return { onValueChange, screen: await render(<Harness />) };
};

test('typed garbage never reaches the value and blur restores it', async () => {
  const { onValueChange, screen } = await renderField();
  const field = screen.getByRole('spinbutton', { name: 'ambient' });

  await field.fill('');
  onValueChange.mockClear();
  await userEvent.type(field, 'xfasdf1.00');
  await userEvent.tab();

  expect(onValueChange).not.toHaveBeenCalled();
  await expect.element(field).toHaveValue('0.60');
});

test('pasted garbage never reaches the value', async () => {
  const { onValueChange, screen } = await renderField();
  const source = await render(
    <input aria-label='source' defaultValue='xfasdf1.00' />,
  );

  // A real copy and a real paste: a synthetic paste event inserts nothing, so
  // it would pass against a field that accepted anything.
  await source.getByRole('textbox', { name: 'source' }).click();
  await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}');
  await userEvent.copy();
  await screen.getByRole('spinbutton', { name: 'ambient' }).click();
  await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}');
  await userEvent.paste();
  await userEvent.tab();

  expect(onValueChange).not.toHaveBeenCalled();
  await expect
    .element(screen.getByRole('spinbutton', { name: 'ambient' }))
    .toHaveValue('0.60');
});

test('a typed number applies while typing', async () => {
  const { onValueChange, screen } = await renderField();

  await screen.getByRole('spinbutton', { name: 'ambient' }).fill('0.85');

  expect(onValueChange).toHaveBeenLastCalledWith(0.85);
});

test('arrow up adds one step', async () => {
  const { onValueChange, screen } = await renderField();

  await screen.getByRole('spinbutton', { name: 'ambient' }).click();
  await userEvent.keyboard('{ArrowUp}');

  expect(onValueChange).toHaveBeenLastCalledWith(0.61);
});

test('shift makes the step ten times larger', async () => {
  const { onValueChange, screen } = await renderField();

  await screen.getByRole('spinbutton', { name: 'ambient' }).click();
  await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');

  expect(onValueChange).toHaveBeenLastCalledWith(0.5);
});

test('alt makes the step ten times smaller', async () => {
  const { onValueChange, screen } = await renderField();

  await screen.getByRole('spinbutton', { name: 'ambient' }).click();
  await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');

  expect(onValueChange).toHaveBeenLastCalledWith(0.601);
});

test('a value past the max is held at the max', async () => {
  const { onValueChange, screen } = await renderField({ max: 1 });

  await screen.getByRole('spinbutton', { name: 'ambient' }).fill('7');

  expect(onValueChange).toHaveBeenLastCalledWith(1);
});

test('escape undoes the edit made since focus', async () => {
  const { screen } = await renderField();
  const field = screen.getByRole('spinbutton', { name: 'ambient' });

  await field.fill('0.9');
  await userEvent.keyboard('{Escape}');

  await expect.element(field).toHaveValue('0.60');
});

test('an edit that ends in garbage restores the value from before the edit', async () => {
  const { screen } = await renderField();
  const field = screen.getByRole('spinbutton', { name: 'ambient' });

  await field.fill('');
  await userEvent.type(field, '0.8xf');
  await userEvent.tab();

  await expect.element(field).toHaveValue('0.60');
});
