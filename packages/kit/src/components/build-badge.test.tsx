import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { BuildBadge } from './build-badge';

afterEach(() => {
  vi.unstubAllGlobals();
});

const answers = (byPath: Record<string, unknown>) =>
  vi.fn((path: string) => {
    const body = byPath[path];
    return Promise.resolve(
      body === undefined
        ? new Response('<!doctype html>', {
            headers: { 'content-type': 'text/html' },
          })
        : Response.json(body),
    );
  });

test('a worktree shows its branch and a jump to main on main’s port', async () => {
  vi.stubGlobal(
    'fetch',
    answers({
      '/api/build': { branch: 'coder/x', isDev: true, sha: '1234abcd' },
      '/api/build/others': [
        {
          app: 'kit',
          branch: 'main',
          isDev: false,
          name: 'main',
          port: 5180,
          sha: 'a',
        },
        {
          branch: 'coder/y',
          isDev: true,
          name: 'coder/y',
          port: 5200,
          sha: 'b',
        },
      ],
    }),
  );
  const screen = await render(<BuildBadge />);

  await expect.element(screen.getByText('coder/x')).toBeInTheDocument();
  const jump = screen.getByTitle('open this view on main (:5180)');
  await expect
    .element(jump)
    .toHaveAttribute('href', expect.stringContaining(':5180/'));
  // a sibling worktree is the same side as this one, so it gets no jump
  expect(screen.getByText('coder/y').query()).toBeNull();
});

test('an app with no endpoint renders nothing, even when a spa fallback answers with html', async () => {
  const fetchMock = answers({});
  vi.stubGlobal('fetch', fetchMock);
  const screen = await render(<BuildBadge />);

  // the html answer has been read once the badge's own ask settles
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
  await fetchMock.mock.results[0]?.value;
  expect(screen.container.querySelector('[data-slot=build-badge]')).toBeNull();
});
