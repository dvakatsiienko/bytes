import { Link } from '@tanstack/react-router';

import type { ArchivedTrophy, Game } from '../shared/types.ts';
import { GRADE_COLOR, GRADE_MARK, dateFormat } from './helpers/format.ts';
import { countTotal, dayKey, gameLookup } from './helpers/stats.ts';
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

  const dayListJSX = days.map((day) => {
    const sessionListJSX = day.sessions.map((session) => {
      return <SessionRow key={session.id} session={session} />;
    });

    return (
      <section key={day.date}>
        <header className='sticky top-0 z-10 flex items-baseline gap-3 border-line border-y bg-bg-lift px-4 py-1.5 text-[12px]'>
          <span className='select-text text-orange tracking-[0.15em]'>
            {dateFormat(day.date)}
          </span>
          <span className='text-mute'>
            {day.count} {day.count === 1 ? 'trophy' : 'trophies'}
          </span>
        </header>
        <ul>{sessionListJSX}</ul>
      </section>
    );
  });

  return (
    <main className='flex min-h-0 flex-1 flex-col'>
      <section className='panel flex min-h-0 min-w-0 flex-col'>
        <span className='panel-title'>log · {LIMIT} most recent</span>
        <p className='border-line border-b px-4 py-2 text-[12px] text-dim'>
          every trophy you have earned, newest first · a run on one title inside{' '}
          {SESSION_HOURS} hours is grouped as one sitting, nothing hidden
        </p>
        <div className='min-h-0 flex-1 overflow-y-auto'>{dayListJSX}</div>
      </section>
    </main>
  );
};

const SessionRow = (props: SessionRowProps) => {
  const { session } = props;

  const trophyListJSX = session.trophies.map((trophy) => {
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
          src={session.iconUrl}
          width={32}
        />
        <Link
          className='min-w-0 flex-1 cursor-pointer select-text truncate text-fg-soft hover:text-orange'
          params={{ gameId: session.gameId }}
          to='/library/$gameId'>
          {session.name}
        </Link>
        {session.defined > 0 && <SessionShare session={session} />}
      </div>

      {/* Every trophy of the sitting, listed. The page is short and there is
          nothing to gain by folding them away. */}
      {/* ml-4 lands the spine under the game icon above it, so the branch
          reads as descending from the title rather than from the row edge. */}
      <ul className='tree mt-1.5 ml-4'>{trophyListJSX}</ul>
    </li>
  );
};

/**
 * How far this sitting moved the title, in trophies earned of trophies defined.
 *
 * 📌 Counts, never PSN's own percentage. PSN weights `progress` by grade in a
 * way this app cannot reproduce — the closest formula fitted 92 of 109 titles,
 * so a figure derived from it would be quietly wrong on the rest. Counts are
 * exact, and the archive's timestamps make the *historical* position exact too:
 * the bar shows where the title stood when the sitting began, not where it
 * stands today.
 */
const SessionShare = (props: SessionShareProps) => {
  const { session } = props;
  const from = session.before / session.defined;
  const to = (session.before + session.count) / session.defined;

  return (
    <span className='flex shrink-0 items-center gap-2 text-[12px] tabular-nums'>
      <span
        aria-hidden
        className='relative h-1.5 w-24 overflow-hidden bg-line/40'>
        {/* where the title already stood when the sitting began */}
        <span
          className='absolute inset-y-0 left-0 bg-dim/60'
          style={{ width: `${from * 100}%` }}
        />
        {/* the step this sitting was — its real place on the run, not today's */}
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

/**
 * A sitting, not a clock hour. Trophies on one title inside this window are one
 * play session, which is what makes the list read as a history rather than as
 * two thousand separate lines.
 */
const SESSION_HOURS = 3;
const SESSION_MS = SESSION_HOURS * 60 * 60 * 1000;

const timeFormat = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  });

/**
 * Newest first, collapsed into sittings, then cut into days.
 *
 * The archive is stored oldest-first, so it is reversed once here rather than
 * sorted per render. A session breaks on a different title or on a gap wider
 * than the window — never on a day boundary, because a session that runs past
 * midnight is still one sitting and lands on the day it started.
 */
const logDays = (trophies: ArchivedTrophy[], games: Game[]): LogDay[] => {
  const byId = gameLookup(games);

  /**
   * How many of a title's trophies existed before a given instant.
   *
   * The whole archive is walked, not just the window the log shows — a sitting
   * from 2023 has to be measured against where that title stood in 2023. The
   * archive is already sorted oldest-first, so a per-game slice keeps that
   * order and the answer is an index.
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

  const sessions: LogSession[] = [];

  for (const trophy of recent) {
    const open = sessions.at(-1);
    const withinWindow =
      open &&
      open.gameId === trophy.gameId &&
      Date.parse(open.oldestAt) - Date.parse(trophy.at) <= SESSION_MS;

    if (open && withinWindow) {
      open.count += 1;
      open.oldestAt = trophy.at;
      open.trophies.push(trophy);
      if (trophy.rarity < open.rarest.rarity) open.rarest = trophy;
      continue;
    }

    const game = byId.get(trophy.gameId);
    sessions.push({
      at: trophy.at,
      before: 0,
      count: 1,
      defined: game ? countTotal(game.defined) : 0,
      gameId: trophy.gameId,
      iconUrl: game?.iconUrl ?? '',
      id: `${trophy.gameId}-${trophy.at}`,
      name: game?.name ?? trophy.gameId,
      oldestAt: trophy.at,
      rarest: trophy,
      trophies: [trophy],
    });
  }

  // Filled after the fact: a sitting's oldest trophy is not known until the
  // sitting stops growing.
  for (const session of sessions)
    session.before = earnedBefore(session.gameId, session.oldestAt);

  const days: LogDay[] = [];

  for (const session of sessions) {
    const date = dayKey(new Date(session.at));
    const open = days.at(-1);

    if (open?.date === date) {
      open.count += session.count;
      open.sessions.push(session);
      continue;
    }

    days.push({ count: session.count, date, sessions: [session] });
  }

  return days;
};

/* Types */
interface SessionRowProps {
  session: LogSession;
}

interface SessionShareProps {
  session: LogSession;
}

interface LogSession {
  /** When the sitting's newest trophy popped — what the row prints. */
  at: string;
  /**
   * Trophies already earned in this title when the sitting began — what makes
   * the bar show the step this sitting was, rather than where the title sits
   * today.
   */
  before: number;
  count: number;
  /** Trophies the title defines in total — the bar's denominator. */
  defined: number;
  gameId: string;
  iconUrl: string;
  id: string;
  name: string;
  /** The far end of the sitting, which is what the window is measured against. */
  oldestAt: string;
  /** Lowest global earn rate in the sitting — the one worth the header badge. */
  rarest: ArchivedTrophy;
  /** Every trophy in the sitting, newest first. Nothing is hidden. */
  trophies: ArchivedTrophy[];
}

interface LogDay {
  count: number;
  date: string;
  sessions: LogSession[];
}
