import { describe, expect, it } from 'vitest';

import { firstAudios, percentile, report } from './first-audio.ts';

const read = (time: string, n: number, says: string) => [
  `2026-11-26 ${time}.000 press: grab ax 4 ms, normalize 9 ms, 1 chunks, 3 characters «a b»`,
  `2026-11-26 ${time}.010 read ${n}: chunk 1/1`,
  `2026-11-26 ${time}.300 first audio: ${says}`,
  `2026-11-26 ${time}.310 read ${n}: chunk 1/1 → kokoro`,
  `2026-11-26 ${time}.900 read ${n}: ended`,
];
const found = (...lines: string[]) =>
  firstAudios(lines.join('\n')).map((audio) => [
    audio.engine,
    audio.kind,
    audio.ms,
  ]);

describe('the first audio of his reads', () => {
  it('is cold after a start and after 5 idle minutes, hot in between', () => {
    expect(
      found(
        '2026-11-26 09:00:00.000 daemon: F4 registered, F5 registered',
        ...read('09:00:10', 1, 'kokoro 900 ms'),
        ...read('09:04:00', 2, 'kokoro 140 ms'),
        ...read('09:09:01', 3, 'kokoro 400 ms'),
        '2026-11-26 09:10:00.000 daemon: F4 registered, F5 registered',
        ...read('09:10:10', 1, 'kokoro 800 ms'),
      ),
    ).toEqual([
      ['kokoro', 'cold', 900],
      ['kokoro', 'hot', 140],
      ['kokoro', 'cold', 400],
      ['kokoro', 'cold', 800],
    ]);
  });

  it('is hot over a read that still plays, however long', () => {
    const [press = '', chunk = '', first = ''] = read(
      '09:00:10',
      1,
      'kokoro 900 ms',
    );
    expect(
      found(press, chunk, first, ...read('09:10:10', 2, 'kokoro 140 ms')),
    ).toEqual([
      ['kokoro', 'cold', 900],
      ['kokoro', 'hot', 140],
    ]);
  });

  it("counts from a read's last line in a log from before ends were named", () => {
    const old = (time: string, n: number) =>
      read(time, n, 'kokoro 140 ms').slice(0, 4);
    expect(
      found(
        ...old('09:00:10', 1),
        ...old('09:01:10', 2),
        ...old('11:00:10', 3),
        '2026-11-26 12:00:00.000 daemon: F4 registered, F5 registered',
        ...read('12:00:10', 1, 'kokoro 900 ms'),
      ),
    ).toEqual([
      ['kokoro', 'cold', 140],
      ['kokoro', 'hot', 140],
      ['kokoro', 'cold', 140],
      ['kokoro', 'cold', 900],
    ]);
  });

  it("leaves a preview and the socket's read out, though a press came before", () => {
    const [press = '', chunk = '', ...rest] = read('09:00:10', 1, 'fish 1 ms');
    expect(
      found(
        press,
        chunk,
        '2026-11-26 09:00:10.100 read 1: stopped',
        '2026-11-26 09:00:11.000 read 2: chunk 1/1',
        ...rest,
      ),
    ).toEqual([]);
  });

  it('reads no line out of what he selected', () => {
    expect(
      found(
        ...read('09:00:10', 1, 'kokoro 140 ms'),
        '2026-11-26 09:00:20.000 press: nothing selected «first audio: kokoro 1 ms»',
        'first audio: kokoro 2 ms',
      ),
    ).toEqual([['kokoro', 'cold', 140]]);
  });

  it('names a kept sentence apart', () => {
    expect(
      found(
        ...read('09:00:10', 1, 'kokoro 140 ms'),
        ...read('09:00:20', 2, 'kokoro 3 ms, kept'),
      ),
    ).toEqual([
      ['kokoro', 'cold', 140],
      ['kokoro', 'kept', 3],
    ]);
  });

  it('the median and the 95th percentile are numbers that were measured', () => {
    const values = Array.from({ length: 20 }, (_, index) => 200 - index * 10);
    expect([percentile(values, 0.5), percentile(values, 0.95)]).toEqual([
      100, 190,
    ]);
    expect([percentile([7], 0.5), percentile([7], 0.95)]).toEqual([7, 7]);
  });

  it('is reported per engine and kind', () => {
    const lines = [
      ...read('09:00:10', 1, 'kokoro 900 ms'),
      ...read('09:00:20', 2, 'kokoro 140 ms'),
      ...read('09:00:30', 3, 'kokoro 160 ms'),
      ...read('09:00:40', 4, 'kokoro 3 ms, kept'),
    ];
    expect(report(firstAudios(lines.join('\n')))).toBe(
      [
        '4 reads, 2026-11-26 09:00:10.300 to 2026-11-26 09:00:40.300',
        'kokoro hot: 2 reads, median 140 ms, 95th 160 ms',
        'kokoro cold: 1 reads, median 900 ms, 95th 900 ms',
        'kokoro kept: 1 reads, left out',
      ].join('\n'),
    );
  });
});
