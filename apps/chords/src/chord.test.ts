import { describe, expect, it } from 'vitest';

import { canonicalQuery, joinChord, pressedChord } from './chord.ts';

// not the daemon's real order: the query follows whatever order the answer carries
const order = ['meta', 'shift', 'cmd'];

describe('pressedChord', () => {
  it('picks the chord over the bare modifier released in the same tick', () => {
    const previous = { ctrl: 40, 'ctrl+shift+cmd+4': 2 };
    const counts = { ctrl: 41, 'ctrl+shift+cmd+4': 3 };

    expect(pressedChord(previous, counts)).toBe('ctrl+shift+cmd+4');
  });

  it('still reports a bare modifier pressed alone', () => {
    expect(pressedChord({ cmd: 1 }, { cmd: 2 })).toBe('cmd');
  });
});

describe('canonicalQuery', () => {
  it('sorts typed modifiers into the order the daemon sent', () => {
    expect(canonicalQuery('cmd+shift+l', order)).toBe('shift+cmd+l');
  });

  it('sorts a modifier run with no key on it', () => {
    expect(canonicalQuery('cmd+shift', order)).toBe('shift+cmd');
  });

  it('leaves prose alone, so the same needle can match a note', () => {
    expect(canonicalQuery('linear', order)).toBe('linear');
  });
});

describe('joinChord', () => {
  it('joins a layer and a key', () => {
    expect(joinChord('ctrl+cmd', 'f')).toBe('ctrl+cmd+f');
  });

  it('spells a key of the no-modifier layer as the key alone', () => {
    expect(joinChord('', 'f4')).toBe('f4');
  });
});
