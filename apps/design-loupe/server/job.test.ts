import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  claimPush,
  markAsk,
  readJob,
  reopenAsk,
  sendToDesigner,
  writeAnswer,
} from './job.ts';

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
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 1 });
    const answer = JSON.parse(readFileSync(join(job, 'answers.json'), 'utf8'))
      .answers['ask-1'];
    expect(answer).toMatchObject({
      pick: 1,
      rev: expect.stringMatching(shortHash),
    });
  });

  it('refuses an option the ask does not have', async () => {
    await expect(
      writeAnswer(job, { id: 'ask-1', note: '', pick: 2 }),
    ).rejects.toThrow('has no option 3');
  });

  it('keeps every answer when answers arrive at once', async () => {
    await Promise.all([
      writeAnswer(job, { id: 'ask-1', note: '', pick: 0 }),
      writeAnswer(job, { id: 'ask-2', note: 'ship it', pick: null }),
    ]);
    expect((await readJob(job)).asks.map((ask) => ask.state)).toEqual([
      'answered',
      'answered',
    ]);
  });
});

describe("an ask's life", () => {
  it('reads seen once the designer marks the answer seen', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await markAsk(job, { as: 'seen', id: 'ask-1' });
    expect(await stateOf('ask-1')).toBe('seen');
  });

  it('reads applied once the designer marks it applied', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    expect(await stateOf('ask-1')).toBe('applied');
  });

  it('reads open again after a reopen, even when it was applied', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    await reopenAsk(job, 'ask-1');
    expect(await stateOf('ask-1')).toBe('open');
  });

  it('reads answered for a new answer after an applied one', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await markAsk(job, { as: 'applied', id: 'ask-1', version: 'v2' });
    await reopenAsk(job, 'ask-1');
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 1 });
    expect(await stateOf('ask-1')).toBe('answered');
  });
});

describe('notes', () => {
  it('keep the pick', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 1 });
    await writeAnswer(job, {
      id: 'ask-1',
      note: 'and make it bigger',
      pick: null,
    });
    expect((await readJob(job)).asks[0]?.answer?.pick).toBe(1);
  });

  it('append, oldest first, each with its time', async () => {
    await writeAnswer(job, { id: 'ask-1', note: 'first', pick: null });
    await writeAnswer(job, { id: 'ask-1', note: 'second', pick: null });
    const notes = (await readJob(job)).asks[0]?.answer?.notes ?? [];
    expect(notes.map((note) => note.text)).toEqual(['first', 'second']);
  });

  it('survive a reopen', async () => {
    await writeAnswer(job, { id: 'ask-1', note: 'keep this', pick: 0 });
    await reopenAsk(job, 'ask-1');
    const [ask] = (await readJob(job)).asks;
    expect([ask?.state, ask?.answer?.notes.length]).toEqual(['open', 1]);
  });

  it('read an answer written as one text line as its first note', async () => {
    writeFileSync(
      join(job, 'answers.json'),
      JSON.stringify({
        'ask-1': {
          at: '2026-10-02T12:00:00.000Z',
          pick: 0,
          rev: 'abcdef12',
          text: 'old line',
        },
      }),
    );
    expect((await readJob(job)).asks[0]?.answer?.notes).toEqual([
      { at: '2026-10-02T12:00:00.000Z', text: 'old line' },
    ]);
  });
});

describe('handovers', () => {
  const sentBy = async () =>
    (await readJob(job)).sent.map((handover) => handover.by);

  it('wait while an ask is still open', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    expect(await sentBy()).toEqual([]);
  });

  it('come once, when the last open ask is answered', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await writeAnswer(job, { id: 'ask-2', note: 'go', pick: null });
    expect(await sentBy()).toEqual(['all answered']);
  });

  it('leave a change after the handover for the next one', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await writeAnswer(job, { id: 'ask-2', note: 'go', pick: null });
    await writeAnswer(job, { id: 'ask-1', note: 'one more thing', pick: null });
    expect([await sentBy(), (await readJob(job)).unsent]).toEqual([
      ['all answered'],
      ['ask-1'],
    ]);
  });

  it('come early on «send to designer», open asks and all', async () => {
    await writeAnswer(job, { id: 'ask-1', note: '', pick: 0 });
    await sendToDesigner(job);
    expect(await sentBy()).toEqual(['send to designer']);
  });

  it('read a handover written as «send round» as «send to designer»', async () => {
    writeFileSync(
      join(job, 'answers.json'),
      JSON.stringify({
        answers: {},
        sent: [{ at: '2026-10-02T12:00:00.000Z', by: 'send round', round: 1 }],
      }),
    );
    expect(await sentBy()).toEqual(['send to designer']);
  });

  it('refuse «send to designer» with nothing new', async () => {
    await expect(sendToDesigner(job)).rejects.toThrow('nothing new to send');
  });
});

describe('claimPush', () => {
  it('refuses a second push for the same round', async () => {
    await claimPush(job);
    await expect(claimPush(job)).rejects.toThrow('round 1 was pushed already');
  });
});
