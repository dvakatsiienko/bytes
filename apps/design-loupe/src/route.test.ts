import { describe, expect, it } from 'vitest';

import { askPath, boardPath, parseRoute } from './route.ts';

describe('parseRoute', () => {
  it('reads an ask path', () => {
    expect(parseRoute('/speak/ask/12')).toEqual({
      ask: 'ask-12',
      job: 'speak',
      kind: 'ask',
    });
  });

  it('reads a board path', () => {
    expect(parseRoute('/speak/board/admin-900')).toEqual({
      board: 'admin-900',
      job: 'speak',
      kind: 'board',
    });
  });

  it('reads anything else as the overview', () => {
    expect(parseRoute('/speak/ask/two')).toEqual({
      job: 'speak',
      kind: 'overview',
    });
  });
});

describe('the paths', () => {
  it('give an ask its number', () => {
    expect(askPath('speak', 'ask-3')).toBe('/speak/ask/3');
  });

  it('read back what they write for a board', () => {
    expect(parseRoute(boardPath('speak', 'T1 merge · admin'))).toMatchObject({
      board: 'T1 merge · admin',
    });
  });
});
