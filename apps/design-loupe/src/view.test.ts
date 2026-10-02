import { describe, expect, it } from 'vitest';

import {
  faviconSvg,
  frameRect,
  parseHash,
  stepAsk,
  tabTitle,
  wheelView,
} from './view.ts';

const wheel = {
  ctrlKey: false,
  deltaMode: 0,
  deltaX: 0,
  deltaY: 0,
  metaKey: false,
  pointX: 300,
  pointY: 200,
};

describe('frameRect', () => {
  it('centres the rect in the viewport with the pad on its tighter side', () => {
    const view = frameRect(
      { h: 900, w: 1440, x: 100, y: 50 },
      { h: 600, w: 1000 },
      50,
    );
    expect(view.scale).toBeCloseTo((600 - 100) / 900);
    expect(view.x + (100 + 720) * view.scale).toBeCloseTo(500);
    expect(view.y + (50 + 450) * view.scale).toBeCloseTo(300);
  });
});

describe('wheelView', () => {
  it('keeps the point under the pointer still on a pinch', () => {
    const view = { scale: 0.5, x: 40, y: -20 };
    const next = wheelView(view, { ...wheel, ctrlKey: true, deltaY: -30 });
    const before = (wheel.pointX - view.x) / view.scale;
    const after = (wheel.pointX - next.x) / next.scale;
    expect(after).toBeCloseTo(before);
    expect(next.scale).toBeGreaterThan(view.scale);
  });

  it('returns the exact scale after an equal pinch back', () => {
    const view = { scale: 0.37, x: 0, y: 0 };
    const there = wheelView(view, { ...wheel, ctrlKey: true, deltaY: 40 });
    expect(
      wheelView(there, { ...wheel, ctrlKey: true, deltaY: -40 }).scale,
    ).toBeCloseTo(0.37, 10);
  });

  it('pans on a plain scroll', () => {
    expect(
      wheelView({ scale: 1, x: 0, y: 0 }, { ...wheel, deltaX: 10, deltaY: 30 }),
    ).toEqual({ scale: 1, x: -10, y: -30 });
  });
});

describe('parseHash', () => {
  it('reads an ask link', () => {
    expect(parseHash('#ask-12')).toEqual({ ask: 'ask-12', kind: 'ask' });
  });

  it('reads a board link', () => {
    expect(parseHash('#board-admin-900')).toEqual({
      board: 'admin-900',
      kind: 'board',
    });
  });

  it('reads anything else as the overview', () => {
    expect(parseHash('#nonsense')).toEqual({ kind: 'overview' });
  });
});

describe('stepAsk', () => {
  const asks = [
    { id: 'ask-1', state: 'answered' },
    { id: 'ask-2', state: 'open' },
    { id: 'ask-3', state: 'open' },
  ] as const;

  it('starts at the first open ask', () => {
    expect(stepAsk(asks, undefined, 1)).toBe('ask-2');
  });

  it('wraps past the last ask', () => {
    expect(stepAsk(asks, 'ask-3', 1)).toBe('ask-1');
  });
});

describe('the open count', () => {
  it('leads the tab title', () => {
    expect(tabTitle('speak', 3)).toBe('(3) speak · loupe');
  });

  it('leaves the title when nothing is open', () => {
    expect(tabTitle('speak', 0)).toBe('speak · loupe');
  });

  it('is drawn on the favicon', () => {
    expect(faviconSvg(3)).toContain('>3</text>');
  });

  it('is absent from the favicon when nothing is open', () => {
    expect(faviconSvg(0)).not.toContain('<text');
  });
});
