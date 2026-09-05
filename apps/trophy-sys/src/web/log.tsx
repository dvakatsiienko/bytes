import { Link } from '@tanstack/react-router';

import type { ArchivedTrophy, Game } from '../shared/types.ts';
import { GRADE_COLOR, GRADE_MARK } from './helpers/format.ts';
import {
  DAY_ROLLOVER_HOURS,
  countTotal,
  gameLookup,
  gamingDayKey,
  trophyOrder,
} from './helpers/stats.ts';
import { useGames, useStats } from './hooks/queries.ts';

export const Log = () => {
  const games = useGames();
  const stats = useStats();

  const gameList = games.data ?? [];
  const archive = stats.data;

  if (games.isPending || stats.isPending) return <Note>reading…</Note>;
  if (games.isError) return <Note>could not read the library</Note>;
  if (stats.isError) return <Note>could not read the archive</Note>;
  if (!archive?.syncedAt)
    return (
      <Note>
        no trophy archive yet. open /stats and run the scan once — the log reads
        the same archive.
      </Note>
    );

  const days = logDays(archive.trophies, gameList);

  if (days.length === 0) return <Note>nothing earned yet.</Note>;

  // Counted from what survived, never from LIMIT: a cut final day is dropped,
  // so the window's size and the list's size are not the same number.
  const shown = days.reduce((total, day) => total + day.count, 0);

  const dayListJSX = days.map((day) => {
    const gameListJSX = day.games.map((gameDay) => {
      return <GameDayRow gameDay={gameDay} key={gameDay.id} />;
    });

    return (
      <section key={day.date}>
        <header className='sticky top-0 z-10 flex items-baseline gap-3 border-line border-y bg-bg-lift px-4 py-1.5 text-[12px]'>
          {/* Printed, not parsed. `date` is already a local gaming-day key, and
              sending it back through a Date would read it as UTC midnight. */}
          <span className='select-text text-orange tracking-[0.15em]'>
            {day.date.replace(/-/g, '.')}
          </span>
          <span className='text-mute'>
            {day.count} {day.count === 1 ? 'trophy' : 'trophies'}
          </span>
        </header>
        <ul>{gameListJSX}</ul>
      </section>
    );
  });

  return (
    <main className='flex min-h-0 flex-1 flex-col'>
      <section className='panel flex min-h-0 min-w-0 flex-col'>
        <span className='panel-title'>log · {shown} most recent</span>
        <p className='border-line border-b px-4 py-2 text-[12px] text-dim'>
          every trophy you have earned, newest first · one row per title per
          day, nothing hidden · a day runs to{' '}
          {String(DAY_ROLLOVER_HOURS).padStart(2, '0')}:00, so a past-midnight
          trophy stays with the evening it came from
        </p>
        <div className='min-h-0 flex-1 overflow-y-auto'>{dayListJSX}</div>
      </section>
    </main>
  );
};

const GameDayRow = (props: GameDayRowProps) => {
  const trophyListJSX = props.gameDay.trophies.map((trophy) => {
    return (
      <li
        className='flex items-center gap-2 py-1'
        key={`${trophy.gameId}-${trophy.name}-${trophy.at}`}>
        {trophy.iconUrl ? (
          <img
            alt=''
            className='size-7 shrink-0 border border-line bg-bg-soft object-contain'
            height={28}
            loading='lazy'
            src={trophy.iconUrl}
            width={28}
          />
        ) : (
          // An archive written before the log route carries no icons; the grade
          // mark holds the column so the rows stay aligned either way.
          <span
            className={`${GRADE_COLOR[trophy.grade]} grid size-7 shrink-0 place-items-center`}>
            {GRADE_MARK[trophy.grade]}
          </span>
        )}

        <span className='min-w-0 flex-1'>
          <span className='flex items-baseline gap-1.5'>
            <span
              className={`${GRADE_COLOR[trophy.grade]} shrink-0 text-[12px]`}>
              {GRADE_MARK[trophy.grade]}
            </span>
            <span className='select-text truncate text-[12px] text-fg-soft'>
              {trophy.name}
            </span>
          </span>
          {trophy.detail && (
            <span className='block select-text truncate text-[12px] text-mute'>
              {trophy.detail}
            </span>
          )}
        </span>

        <span className='shrink-0 select-text text-[12px] text-dim tabular-nums'>
          {trophy.rarity}%
        </span>
        <span className='w-11 shrink-0 text-right text-[12px] text-dim tabular-nums'>
          {timeFormat(trophy.at)}
        </span>
      </li>
    );
  });

  return (
    <li className='border-line/60 border-b px-4 py-2 last:border-b-0'>
      <div className='flex items-center gap-3'>
        <img
          alt=''
          className='size-8 shrink-0 border border-line bg-bg-soft object-contain'
          height={32}
          loading='lazy'
          src={props.gameDay.iconUrl}
          width={32}
        />
        <Link
          className='min-w-0 flex-1 cursor-pointer select-text truncate text-fg-soft hover:text-orange'
          params={{ gameId: props.gameDay.gameId }}
          to='/library/$gameId'>
          {props.gameDay.name}
        </Link>
        {props.gameDay.defined > 0 && <GameDayShare gameDay={props.gameDay} />}
      </div>

      {/* Every trophy of the day, listed. The page is short and there is
          nothing to gain by folding them away. */}
      {/* ml-4 lands the spine under the game icon above it, so the branch
          reads as descending from the title rather than from the row edge. */}
      <ul className='tree mt-1.5 ml-4'>{trophyListJSX}</ul>
    </li>
  );
};

/**
 * How far this day moved the title, in trophies earned of trophies defined.
 *
 * 📌 Counts, never PSN's own percentage. PSN weights `progress` by grade in a
 * way this app cannot reproduce — the closest formula fitted 92 of 109 titles,
 * so a figure derived from it would be quietly wrong on the rest. Counts are
 * exact, and the archive's timestamps make the *historical* position exact too:
 * the bar shows where the title stood when the day began, not where it stands
 * today.
 */
const GameDayShare = (props: GameDayShareProps) => {
  const from = props.gameDay.before / props.gameDay.defined;
  const to =
    (props.gameDay.before + props.gameDay.count) / props.gameDay.defined;

  return (
    <span className='flex shrink-0 items-center gap-2 text-[12px] tabular-nums'>
      <span
        aria-hidden
        className='relative h-1.5 w-24 overflow-hidden bg-line/40'>
        {/* where the title already stood when the day began */}
        <span
          className='absolute inset-y-0 left-0 bg-dim/60'
          style={{ width: `${from * 100}%` }}
        />
        {/* the step this day was — its real place on the run, not today's */}
        <span
          className='absolute inset-y-0 bg-orange'
          style={{ left: `${from * 100}%`, width: `${(to - from) * 100}%` }}
        />
      </span>
      <span className='w-20 text-right text-mute'>
        {Math.round(from * 100)} → {Math.round(to * 100)}%
      </span>
    </span>
  );
};

const Note = ({ children }: { children: string }) => (
  <main className='flex min-h-0 flex-1'>
    <section className='panel grid flex-1 place-items-center px-6 text-center text-dim'>
      {children}
    </section>
  </main>
);

/* Helpers */
/** How many trophies the log holds. No pagination — this is the whole list. */
const LIMIT = 200;

const timeFormat = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  });

/**
 * Newest first, one row per title per gaming day.
 *
 * 📌 The day is the only unit here. An earlier version also collapsed trophies
 * into "sittings" on a 3-hour gap, which split a single evening whenever the
 * player stepped away for dinner — 20:21 to 00:11 on one title read as two
 * separate rows. Two overlapping grouping rules were one too many, and the day
 * is the one worth keeping, so a title that was touched twice in a day is still
 * one row. The only split inside a day is a different title.
 *
 * The archive is stored oldest-first, so it is reversed once here rather than
 * sorted per render. Rows are therefore created in newest-first order and their
 * days never increase, which is what lets the day grouping below just look at
 * the last one instead of sorting.
 */
const logDays = (trophies: ArchivedTrophy[], games: Game[]): LogDay[] => {
  const byId = gameLookup(games);

  /**
   * How many of a title's trophies existed before a given instant.
   *
   * The whole archive is walked, not just the window the log shows — a day in
   * 2023 has to be measured against where that title stood in 2023. The archive
   * is already sorted oldest-first, so a per-game slice keeps that order and
   * the answer is an index.
   */
  const earnedAtById = new Map<string, string[]>();
  for (const trophy of trophies) {
    const seen = earnedAtById.get(trophy.gameId);
    if (seen) seen.push(trophy.at);
    else earnedAtById.set(trophy.gameId, [trophy.at]);
  }
  const earnedBefore = (gameId: string, instant: string) =>
    (earnedAtById.get(gameId) ?? []).filter((at) => at < instant).length;

  const recent = trophies.slice(-LIMIT).reverse();

  const rows: GameDay[] = [];
  // Keyed rather than compared against the previous row: a day where two titles
  // alternate would otherwise open a third row when the first title comes back.
  const rowByKey = new Map<string, GameDay>();

  for (const trophy of recent) {
    const date = gamingDayKey(new Date(trophy.at));
    const key = `${date}|${trophy.gameId}`;
    const open = rowByKey.get(key);

    if (open) {
      open.count += 1;
      open.oldestAt = trophy.at;
      open.trophies.push(trophy);
      continue;
    }

    const game = byId.get(trophy.gameId);
    const row: GameDay = {
      before: 0,
      count: 1,
      date,
      defined: game ? countTotal(game.defined) : 0,
      gameId: trophy.gameId,
      iconUrl: game?.iconUrl ?? '',
      id: key,
      name: game?.name ?? trophy.gameId,
      oldestAt: trophy.at,
      trophies: [trophy],
    };

    rowByKey.set(key, row);
    rows.push(row);
  }

  // Both filled after the fact: a row's oldest trophy is not known until the
  // row stops growing, and the tie order cannot be applied to a partial row.
  for (const row of rows) {
    row.before = earnedBefore(row.gameId, row.oldestAt);
    row.trophies.sort(trophyOrder);
  }

  const days: LogDay[] = [];

  for (const row of rows) {
    const open = days.at(-1);

    if (open?.date === row.date) {
      open.count += row.count;
      open.games.push(row);
      continue;
    }

    days.push({ count: row.count, date: row.date, games: [row] });
  }

  /**
   * Drop the last day when the window cut it in half — when the oldest trophy
   * the log holds still has older siblings on its own gaming day, back in the
   * archive. Left in, that day prints a slice of itself as if it were the whole
   * thing: the invincible evening of 21 trophies read as 12, and its bar showed
   * a leap nothing on screen accounted for. Every day that remains is whole.
   */
  const oldest = recent.at(-1);
  const last = days.at(-1);

  if (oldest && last && last.date === gamingDayKey(new Date(oldest.at))) {
    const isCut = trophies.some(
      (trophy) =>
        trophy.at < oldest.at &&
        gamingDayKey(new Date(trophy.at)) === last.date,
    );

    if (isCut) days.pop();
  }

  return days;
};

/* Types */
interface GameDayRowProps {
  gameDay: GameDay;
}

interface GameDayShareProps {
  gameDay: GameDay;
}

/** One title's trophies on one gaming day — the log's whole unit. */
interface GameDay {
  /**
   * Trophies already earned in this title when the day began — what makes the
   * bar show the step this day was, rather than where the title sits today.
   */
  before: number;
  count: number;
  /** The gaming day this row belongs to, as `YYYY-MM-DD`. */
  date: string;
  /** Trophies the title defines in total — the bar's denominator. */
  defined: number;
  gameId: string;
  iconUrl: string;
  id: string;
  name: string;
  /** The day's first trophy, which is where `before` is measured. */
  oldestAt: string;
  /** Every trophy of the day for this title, newest first. Nothing is hidden. */
  trophies: ArchivedTrophy[];
}

interface LogDay {
  count: number;
  date: string;
  games: GameDay[];
}
