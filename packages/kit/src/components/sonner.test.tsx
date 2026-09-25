import { toast } from 'sonner';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { Toaster } from './sonner';

test('a toast shows its message', async () => {
  const screen = await render(<Toaster />);

  toast('copied look: exact');

  await expect.element(screen.getByText('copied look: exact')).toBeVisible();
});
