import { describe, expect, it } from 'vitest';

import {
  faviconSvg,
  frameRect,
  revealRect,
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

describe('frameRect on a surface narrower than its pad', () => {
  it('keeps the zoom positive', () => {
    expect(
      frameRect({ h: 900, w: 1440, x: 0, y: 0 }, { h: 800, w: 10 }, 48).scale,
    ).toBeGreaterThan(0);
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
    expect(tabTitle('speak', 3)).toBe('(3) speak · design loupe');
  });

  it('leaves the title when nothing is open', () => {
    expect(tabTitle('speak', 0)).toBe('speak · design loupe');
  });

  it('is drawn on the favicon', () => {
    expect(faviconSvg(3)).toContain('>3</text>');
  });

  it('is absent from the favicon when nothing is open', () => {
    expect(faviconSvg(0)).not.toContain('<text');
  });
});

describe('revealRect', () => {
  const viewport = { h: 800, w: 1000 };

  it('leaves a board already on screen where it is', () => {
    expect(
      revealRect(
        { h: 100, w: 100, x: 100, y: 100 },
        { scale: 1, x: 0, y: 0 },
        viewport,
        20,
      ),
    ).toBeNull();
  });

  it('pans a board half past the right edge just far enough to show it whole', () => {
    const view = revealRect(
      { h: 100, w: 200, x: 900, y: 100 },
      { scale: 1, x: 0, y: 0 },
      viewport,
      20,
    );
    expect(view).toEqual({ scale: 1, x: -120, y: 0 });
  });

  it('frames a board too big for the screen at this zoom', () => {
    const view = revealRect(
      { h: 2000, w: 2000, x: 0, y: 0 },
      { scale: 1, x: 0, y: 0 },
      viewport,
      20,
    );
    expect(view?.scale).toBeCloseTo(760 / 2000);
  });
});
