import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { claimPush, markAsk, readJob, reopenAsk, writeAnswer } from './job.ts';

let job: string;
const shortHash = /^[0-9a-f]{8}$/;

beforeEach(() => {
  job = mkdtempSync(join(tmpdir(), 'loupe-job-'));
  mkdirSync(join(job, 'boards'));
  writeFileSync(
    join(job, 'boards/canvas.json'),
    JSON.stringify({
      boards: {
        'a.dc.html': { h: 100, title: 'board a', w: 200, x: 0, y: 0 },
        'b.dc.html': { h: 100, w: 200, x: 300, y: 0 },
      },
      title: 'test job',
    }),
  );
  writeFileSync(
    join(job, 'boards/a.dc.html'),
    '<header id="ask-1">pinned</header>',
  );
  writeFileSync(
    join(job, 'boards/b.dc.html'),
    '<header>nothing pinned</header>',
  );
  writeFileSync(
    join(job, 'asks.json'),
    JSON.stringify({
      asks: [
        {
          board: 'a.dc.html',
          id: 'ask-1',
          kind: 'pick',
          options: ['x', 'y'],
          question: 'x or y?',
          recommend: 0,
        },
        {
          board: 'b.dc.html',
          id: 'ask-2',
          kind: 'open',
          question: 'what now?',
        },
      ],
      boards: 'boards',
      round: 1,
    }),
  );
});

const stateOf = async (id: string) =>
  (await readJob(job)).asks.find((ask) => ask.id === id)?.state;

describe('readJob', () => {
  it('reads an ask without an answer as open', async () => {
    expect(await stateOf('ask-1')).toBe('open');
  });

  it('marks an ask whose pin is gone from its board as moved', async () => {
    const { asks } = await readJob(job);
    expect(asks.map((ask) => ask.isMoved)).toEqual([false, true]);
  });

  it('names a board canvas.json lacks', async () => {
    const asks = JSON.parse(readFileSync(join(job, 'asks.json'), 'utf8'));
    asks.asks[0].board = 'gone.dc.html';
    writeFileSync(join(job, 'asks.json'), JSON.stringify(asks));
    await expect(readJob(job)).rejects.toThrow(
      'ask-1 names board gone.dc.html',
    );
  });
});

describe('writeAnswer', () => {
  it('records the pick with the board revision', async () => {
    await writeAnswer(job, { id: 'ask-1', pick: 1, text: '' });
    const answer = JSON.parse(readFileSync(join(job, 'answers.json'), 'utf8'))[
      'ask-1'
    ];
    expect(answer).toMatchObject({
      pick: 1,
      rev: expect.stringMatching(shortHash),
    });
  });

  it('refuses an option the ask does not have', async () => {
    await expect(
      writeAnswer(job, { id: 'ask-1', pick: 2, text: '' }),
    ).rejects.toThrow('has no option 3');
  });

  it('keeps every answer when answers arrive at once', async () => {
    await Promise.all([
      writeAnswer(job, { id: 'ask-1', pick: 0, text: '' }),
      writeAnswer(job, { id: 'ask-2', pick: null, text: 'ship it' }),
    ]);
    expect((await readJob(job)).asks.map((ask) => ask.state)).toEqual([
      'answered',
      'answered',
    ]);
  });
});

describe("an ask's life", () => {
  it('reads seen once the designer marks the answer seen', async () => {
    await writeAnswer(job, { id: 'ask-1', pick: 0, text: '' });
    await markAsk(job, { as: 'seen', id: 'ask-1' });
    expect(await stateOf('ask-1')).toBe('seen');
  });

  it('reads applied once the designer marks it applied', async () => {
    await writeAnswer(job, { id: 'ask-1', pick: 0, text: '' });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    expect(await stateOf('ask-1')).toBe('applied');
  });

  it('reads open again after a reopen, even when it was applied', async () => {
    await writeAnswer(job, { id: 'ask-1', pick: 0, text: '' });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    await reopenAsk(job, 'ask-1');
    expect(await stateOf('ask-1')).toBe('open');
  });

  it('reads answered for a new answer after an applied one', async () => {
    await writeAnswer(job, { id: 'ask-1', pick: 0, text: '' });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    await reopenAsk(job, 'ask-1');
    await writeAnswer(job, { id: 'ask-1', pick: 1, text: '' });
    expect(await stateOf('ask-1')).toBe('answered');
  });
});

describe('claimPush', () => {
  it('refuses a second push for the same round', async () => {
    await claimPush(job);
    await expect(claimPush(job)).rejects.toThrow('round 1 was pushed already');
  });
});
