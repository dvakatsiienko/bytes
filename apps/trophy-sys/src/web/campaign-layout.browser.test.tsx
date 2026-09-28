import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-react';

import { archiveFixture, gamesFixture } from './campaign.fixture.ts';
import { Campaign } from './campaign.tsx';
import './theme.css';

/**
 * The chart-layout invariant. Every x-axis chart on /campaign ends the same
 * distance above its panel's bottom edge, and no tick label is cut by its svg.
 * Hand-typed bottom margins drifted to 36/26/22 once, and four more axis faults
 * were only ever found by eye; this reads the drawn page, so it catches the
 * next one on the day it lands. Runs at every viewport the config names.
 */

afterEach(cleanup);

/** The x axes /campaign draws today — fewer means a chart stopped drawing. */
const X_AXIS_CHARTS = 7;

const campaignRender = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    },
  });
  client.setQueryData(['games'], gamesFixture);
  client.setQueryData(['stats'], archiveFixture);
  client.setQueryData(['settings'], { effortHideUntouched: false });

  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: createRootRoute({
      component: () => (
        <div className='flex h-screen flex-col p-6'>
          <Campaign />
        </div>
      ),
    }),
  });

  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

interface AxisReading {
  chart: string;
  /** Tick labels, on any axis, sticking out of the chart's svg. */
  clipped: string[];
  /** Panel bottom edge minus the lowest tick label's bottom, in px. */
  gap: number;
}

/**
 * The chart's own svg, never the nearest one: visx wraps every tick label in a
 * small `<svg style="overflow: visible">`, which contains nothing and clips
 * nothing, so measuring against it passed a label drawn outside the chart.
 */
const outerSvg = (node: Element) => {
  let svg = node.closest('svg');
  while (svg?.parentElement?.closest('svg'))
    svg = svg.parentElement.closest('svg');
  return svg;
};

const axesRead = (): AxisReading[] =>
  [...document.querySelectorAll<HTMLElement>('section.panel')].flatMap(
    (panel) => {
      const axes = panel.querySelectorAll('.visx-axis-bottom');
      if (!axes.length) return [];

      const labels = [...panel.querySelectorAll('.visx-axis-bottom text')];
      const lowest = Math.max(
        ...labels.map((label) => label.getBoundingClientRect().bottom),
      );

      // Every axis, the left ones too: `2,000` drew as `,000` for months when
      // the left margin was a hand-typed 38.
      const ticks = [...panel.querySelectorAll('.visx-axis text')];
      const clipped = ticks.flatMap((label) => {
        const box = label.getBoundingClientRect();
        const svg = outerSvg(label)?.getBoundingClientRect();
        if (!svg || box.width === 0) return [];
        const inside =
          box.left >= svg.left - 0.5 &&
          box.right <= svg.right + 0.5 &&
          box.top >= svg.top - 0.5 &&
          box.bottom <= svg.bottom + 0.5;
        return inside ? [] : [label.textContent ?? ''];
      });

      return [
        {
          chart: panel.querySelector('.panel-title')?.textContent ?? 'untitled',
          clipped,
          gap: Math.round(panel.getBoundingClientRect().bottom - lowest),
        },
      ];
    },
  );

test('every x-axis chart ends the same distance above its panel edge', async () => {
  campaignRender();

  await expect
    .poll(() => document.querySelectorAll('.visx-axis-bottom text').length, {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
  await expect.poll(() => axesRead().length).toBe(X_AXIS_CHARTS);

  const readings = axesRead();
  const gaps = new Set(readings.map((reading) => reading.gap));

  expect(
    gaps.size,
    `gaps differ: ${readings.map((r) => `${r.chart} ${r.gap}px`).join(', ')}`,
  ).toBe(1);
});

test('no axis tick label is cut by its chart', async () => {
  campaignRender();

  await expect
    .poll(() => axesRead().length, { timeout: 10_000 })
    .toBe(X_AXIS_CHARTS);

  expect(axesRead().filter((reading) => reading.clipped.length)).toStrictEqual(
    [],
  );
});
