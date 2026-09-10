import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';

import type { Game } from '../shared/types.ts';
import { NPSSO_URL, SETTINGS_DEFAULT, isNonGame } from '../shared/types.ts';
import { Checkbox } from './components/checkbox.tsx';
import { CommandButton } from './components/command-button.tsx';
import { PlatformBadge } from './components/platform-badge.tsx';
import { SegmentedControl } from './components/segmented-control.tsx';
import { ThemeToggle } from './components/theme-toggle.tsx';
import { readoutBuild } from './helpers/npsso-status.ts';
import {
  useAdminGames,
  useAdminLogin,
  useAdminLogout,
  useAdminSession,
  useHiddenSave,
  useNpssoSave,
  useNpssoStatus,
  useSettings,
  useSettingsSave,
} from './hooks/queries.ts';

/**
 * The one route that lives outside `Layout`, so it renders with PSN dead —
 * which is the state it exists to repair. It reads only /api/admin/* and
 * /api/games?all=1, and never touches the profile or news queries.
 */
export const Admin = () => {
  const session = useAdminSession();

  const authed = session.data?.authed === true;

  return (
    <div className='flex h-full flex-col gap-5 overflow-y-auto p-6'>
      <AdminHeader authed={authed} />
      {screenPick(session, authed)}
    </div>
  );
};

/**
 * The nav is copied from `Layout` rather than shared, because reusing `Layout`
 * would pull in useProfile and useGames — the two calls that fail on the dead
 * token this page exists to replace. It is copied down to the theme toggle and
 * the right-hand status slot: the point is that /admin is the fourth tab of
 * one program, not a console bolted to its side.
 */
const AdminHeader = (props: AdminHeaderProps) => {
  const logout = useAdminLogout();

  const tabListJSX = TABS.map((tab) => {
    return (
      <Link
        className='cursor-pointer border border-line px-3 py-1 text-[12px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-dim hover:text-fg-soft focus-visible:outline focus-visible:outline-orange'
        key={tab.to}
        to={tab.to}>
        {tab.label}
      </Link>
    );
  });

  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
      <h1 className='text-lg'>
        <Link
          className='glow inline-block cursor-pointer py-0.5 text-orange tracking-[0.3em] transition-colors hover:text-yellow focus-visible:outline focus-visible:outline-orange'
          to='/library'>
          TROPHY.SYS
        </Link>
      </h1>

      <nav className='flex gap-1'>
        {tabListJSX}
        {/* Not a Link — /admin is where we already are. It wears the shape
            `Layout` gives an active tab so the row reads as one set. */}
        <span className='glow border border-orange px-3 py-1 text-[12px] text-orange uppercase tracking-[0.15em]'>
          admin
        </span>
      </nav>

      <ThemeToggle />

      {/* Session lives where the status string lives on every other route —
          and a sign-out at the top of the page beats one below 258 rows. */}
      {props.authed ? (
        <CommandButton
          className='ml-auto'
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          tone='bare'>
          {logout.isPending ? 'signing out…' : 'sign out'}
        </CommandButton>
      ) : (
        <span className='ml-auto text-[12px] text-dim uppercase tracking-[0.15em]'>
          authorization required
        </span>
      )}
    </div>
  );
};

/**
 * The server answers one message for both a wrong email and a wrong password,
 * and this screen shows it verbatim — telling them apart is an account oracle.
 */
const SignIn = (props: SignInProps) => {
  const login = useAdminLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const error = login.error?.message ?? props.error;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    // Centred rather than parked top-left: signed out there is nothing else on
    // the page, and a 320px box in the corner of a 1280px void reads as a
    // rendering failure.
    <div className='flex flex-1 items-start justify-center pt-6 sm:items-center sm:pt-0'>
      <form
        className='panel flex w-full max-w-88 flex-col gap-4 p-5'
        onSubmit={submit}>
        {/* Deliberately says nothing about what is behind it. The blurb here
            used to name the PSN token as the thing this console writes, which
            is precisely the sentence that turns a stumbled-upon page into a
            worthwhile target. A signed-out screen owes a stranger no context. */}
        <p className='panel-title'>sign in</p>

        <Field
          autoComplete='username'
          id='admin-email'
          label='email'
          onChange={setEmail}
          type='email'
          value={email}
        />

        <Field
          autoComplete='current-password'
          id='admin-password'
          label='password'
          onChange={setPassword}
          type='password'
          value={password}
        />

        {error ? <Note tone='error'>{error}</Note> : null}

        <CommandButton
          className='mt-1'
          disabled={login.isPending}
          tone='primary'
          type='submit'>
          {login.isPending ? 'signing in…' : 'sign in'}
        </CommandButton>
      </form>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <div className='flex min-w-0 flex-col gap-5'>
      {/* Two short forms side by side above the workhorse: at 1280px each was
          previously a single field stretched across the full page. */}
      {/* min-w-0: a grid item's min-width defaults to auto, so one long game
          title stretches the column and then the page. Documented in this app's
          CLAUDE.md after the activity heatmap did exactly that. */}
      <div className='grid min-w-0 gap-5 lg:grid-cols-2'>
        <NpssoForm />
        <SettingsForm />
      </div>

      <GameList />
    </div>
  );
};

/**
 * Only the length is checked here. Whether the token actually authenticates is
 * the server's answer, and it is the only one worth trusting.
 */
const NpssoForm = () => {
  const save = useNpssoSave();
  const [npsso, setNpsso] = useState('');

  const typed = npsso.trim().length;
  const isReady = typed === NPSSO_LENGTH;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isReady) return;
    save.mutate(npsso.trim(), { onSuccess: () => setNpsso('') });
  };

  return (
    <form className='panel flex flex-col gap-3 p-5' onSubmit={submit}>
      <p className='panel-title'>psn token</p>

      {/* The paste box leads the panel: it is the one thing this panel exists
          to do, and everything under it explains or measures that one act. */}
      <Field
        autoComplete='off'
        id='admin-npsso'
        label='npsso'
        onChange={setNpsso}
        placeholder={`paste the ${NPSSO_LENGTH}-character token`}
        spellCheck={false}
        // The counter is the guard made visible: the submit stays dead until
        // it reads 64/64, so the number explains the dead button.
        suffix={
          <span
            className={`tabular-nums ${counterTone(typed, isReady)}`}
            title='an NPSSO is exactly 64 characters'>
            {typed}/{NPSSO_LENGTH}
          </span>
        }
        value={npsso}
      />

      {npssoNote(save)}

      <CommandButton
        className='self-start'
        disabled={save.isPending || !isReady}
        tone='primary'
        type='submit'>
        {save.isPending ? 'saving…' : 'save token'}
      </CommandButton>

      {/* The header carries this link too, but only while PSN is already
          refusing — and this is the panel where the paste happens. */}
      <p className='text-[12px] text-dim leading-relaxed'>
        need a fresh one?{' '}
        <LinkOut href={NPSSO_URL}>get a new NPSSO code</LinkOut> — sign in to
        PSN first, then copy the {NPSSO_LENGTH} characters the page prints.
      </p>

      <TokenReadout />
    </form>
  );
};

/**
 * How old the live token is, and what the dead ones measured — Sony publishes
 * no NPSSO lifetime, so every number here is observed rather than documented.
 *
 * The readout under-claims on purpose: it names its sample count, it prefers
 * the shortest lifetime seen over an average, and with nothing measured yet it
 * offers no estimate at all. A confident wrong number is what this replaces.
 */
const TokenReadout = () => {
  const status = useNpssoStatus(true);

  if (status.isPending)
    return <p className='text-[12px] text-dim'>reading token age…</p>;

  // A failed readout must never look like a dead token — the panel's real job
  // is the paste box below it, and that still works.
  if (status.error || !status.data)
    return (
      <p className='text-[12px] text-dim'>
        token age unavailable — {status.error?.message ?? 'no answer'}
      </p>
    );

  const readout = readoutBuild(status.data);

  const rowListJSX = readout.rows.map((row) => {
    return (
      <div
        className='flex items-baseline justify-between gap-3 px-2.5 py-1'
        key={row.label}>
        <dt className='text-[12px] text-mute uppercase tracking-[0.14em]'>
          {row.label}
        </dt>
        <dd className={`text-[13px] tabular-nums ${row.tone}`}>{row.value}</dd>
      </div>
    );
  });

  const noteListJSX = readout.notes.map((note) => {
    return (
      <p className='text-[12px] text-dim leading-relaxed' key={note}>
        {note}
      </p>
    );
  });

  return (
    <div className='flex flex-col gap-2'>
      {readout.dead ? <Note tone='error'>{readout.dead}</Note> : null}

      <dl className='flex flex-col divide-y divide-line/60 border border-line'>
        {rowListJSX}
      </dl>

      {noteListJSX}
    </div>
  );
};

const SettingsForm = () => {
  const settings = useSettings();
  const save = useSettingsSave();

  const hideUntouched =
    settings.data?.effortHideUntouched ?? SETTINGS_DEFAULT.effortHideUntouched;

  return (
    <section className='panel flex flex-col gap-3 p-5'>
      <p className='panel-title'>settings</p>

      <Checkbox
        checked={hideUntouched}
        disabled={settings.isPending || save.isPending}
        label='hide 0-trophy games from the effort chart'
        onChange={(next) => save.mutate({ effortHideUntouched: next })}
      />

      {/* max-w-prose: at 1280px this paragraph ran the full page width, which
          is roughly 150 characters a line — twice a readable measure. */}
      <p className='max-w-prose text-[12px] text-dim leading-relaxed'>
        the effort chart plots hours against completion. every title bought and
        never opened sits on the same 0% line, so hiding them turns the bar back
        into a scatter.
      </p>

      {save.error ? <Note tone='error'>{save.error.message}</Note> : null}
    </section>
  );
};

/**
 * Paginated rather than virtualised: ~258 titles, a fixed scroll box and a
 * "show more" needs no extra dependency and cannot mis-measure a row height.
 */
const GameList = () => {
  const games = useAdminGames(true);
  const save = useHiddenSave();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<GameSort>('hidden');
  const [shown, setShown] = useState(PAGE);
  // Which ids this page put in flight. One shared `isPending` would grey out
  // all 258 rows for a write that touches one of them.
  // A set, merged and un-merged per request: replacing it meant a second
  // toggle wiped the first row's pending mark, and clearing it on settle
  // unlocked rows whose own request was still in flight.
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  // Which bulk write is in flight, by the `hide` it carries, or null for none.
  const [bulkHide, setBulkHide] = useState<boolean | null>(null);

  const all = useMemo(() => games.data ?? [], [games.data]);
  const hiddenIds = useMemo(
    () => all.filter((game) => game.hidden).map((game) => game.id),
    [all],
  );
  // `|` splits the box into alternatives, which is what lets one preset stand
  // for several spellings. Each alternative is still a plain substring.
  const matched = useMemo(() => {
    const needles = needlesParse(filter);
    if (needles.length === 0) return all;
    return all.filter((game) => {
      const name = game.name.toLowerCase();
      return needles.some((needle) => name.includes(needle));
    });
  }, [all, filter]);

  // `sort` is stable, so the plain order survives inside each group — and a
  // row that gets hidden moves to the top rather than resetting the view.
  const ordered = useMemo(() => {
    if (sort === 'plain') return matched;
    return [...matched].sort(
      (a, b) => Number(Boolean(b.hidden)) - Number(Boolean(a.hidden)),
    );
  }, [matched, sort]);

  const page = ordered.slice(0, shown);

  // One request carries the whole batch, so a row and 258 rows cost the same.
  // The server resolves each id against the auto-hide rule, so two fast toggles
  // compose instead of the second recomputing from a stale render.
  const hiddenApply = (ids: string[], hide: boolean, onDone?: () => void) => {
    setBusyIds((busy) => new Set([...busy, ...ids]));
    save.mutate(
      { hide, ids },
      {
        onSettled: () => {
          setBusyIds((busy) => {
            const next = new Set(busy);
            for (const id of ids) next.delete(id);
            return next;
          });
          onDone?.();
        },
      },
    );
  };

  // The two bulk buttons get their own flag rather than the mutation's global
  // `isPending`: sharing it greyed them out whenever any single row was mid-
  // toggle, which is 257 writes that have nothing to do with them.
  const bulkApply = (hide: boolean) => {
    setBulkHide(hide);
    hiddenApply(
      matched.map((game) => game.id),
      hide,
      () => setBulkHide(null),
    );
  };

  const filterSet = (value: string) => {
    setFilter(value);
    setShown(PAGE);
  };

  const presetListJSX = FILTER_PRESETS.map((preset) => {
    return (
      <CommandButton
        className='border-transparent hover:border-line'
        key={preset.label}
        onClick={() => filterSet(preset.filter)}
        tone='bare'>
        {preset.label}
      </CommandButton>
    );
  });

  const countListJSX = [
    { label: 'matching', value: matched.length },
    { label: 'hidden', value: hiddenIds.length },
    { label: 'total', value: all.length },
  ].map((count) => {
    return (
      <span
        className='flex items-baseline gap-1.5 px-2.5 py-1'
        key={count.label}>
        <span className='text-[12px] text-mute uppercase tracking-[0.14em]'>
          {count.label}
        </span>
        <span
          className={`tabular-nums ${count.label === 'hidden' && count.value > 0 ? 'text-orange' : 'text-fg'}`}>
          {count.value}
        </span>
      </span>
    );
  });

  const rowListJSX = page.map((game, index) => {
    return (
      <GameRow
        busy={busyIds.has(game.id)}
        game={game}
        index={index + 1}
        key={game.id}
        onToggle={() => hiddenApply([game.id], !game.hidden)}
      />
    );
  });

  const error = games.error ?? save.error;

  return (
    <section className='panel flex min-h-0 flex-col'>
      <span className='panel-title'>
        games ·{' '}
        {matched.length === all.length
          ? all.length
          : `${matched.length} / ${all.length}`}
      </span>

      {/* The control bar is the library's: one bordered band across the top of
          the panel, hairline-separated from the rows below it. */}
      <div className='flex flex-col gap-2.5 border-line border-b px-3 py-2.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <input
            className='hint min-w-0 flex-1 border border-line bg-bg-soft px-2 py-1 text-[12px] text-fg placeholder:text-dim focus:border-orange focus:outline-none sm:max-w-72'
            data-hint='Filters by title as you type. `a|b` matches either.'
            onChange={(event) => filterSet(event.target.value)}
            placeholder='filter by name…'
            type='search'
            value={filter}
          />

          {/* Labelled, because two bare words floating beside a search box
              read as results rather than as controls. */}
          <div className='flex shrink-0 items-center border border-line px-1.5 py-0.5'>
            <span className='px-1.5 text-[12px] text-mute uppercase tracking-[0.14em]'>
              presets
            </span>
            <span aria-hidden='true' className='text-line'>
              •
            </span>
            {presetListJSX}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center divide-x divide-line/60 border border-line'>
            {countListJSX}
          </div>

          <span className='ml-auto flex flex-wrap items-center gap-2'>
            <CommandButton
              disabled={bulkHide !== null || matched.length === 0}
              onClick={() => bulkApply(true)}>
              {bulkHide === true ? 'hiding…' : 'hide all matching'}
            </CommandButton>
            <CommandButton
              disabled={bulkHide !== null || matched.length === 0}
              onClick={() => bulkApply(false)}>
              {bulkHide === false ? 'unhiding…' : 'unhide all matching'}
            </CommandButton>
            <SegmentedControl
              label='row order'
              name='admin-game-sort'
              onChange={setSort}
              options={SORT_OPTIONS}
              value={sort}
            />
          </span>
        </div>
      </div>

      {error ? (
        <div className='border-line border-b px-3 py-2'>
          <Note tone='error'>{error.message}</Note>
        </div>
      ) : null}

      {/* The scroll box is a child of the panel, never the panel itself — the
          panel title is absolutely positioned outside the border. */}
      <div className='max-h-[55vh] min-h-0 overflow-y-auto'>
        {/* table-fixed, and the widths ride the header cells rather than a
            colgroup — a `col` cannot be hidden per breakpoint, and below 640px
            the index and platform columns have to go or the title truncates to
            two characters. */}
        <table className='w-full table-fixed'>
          <thead>
            <tr className='text-[12px] text-mute uppercase tracking-[0.14em]'>
              {COLUMNS.map((column) => {
                return (
                  <th
                    className={`sticky top-0 z-10 border-line border-b bg-bg-soft px-3 py-1.5 font-normal ${column.className}`}
                    key={column.head}
                    scope='col'>
                    {column.head}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rowListJSX.length > 0 ? (
              rowListJSX
            ) : (
              <EmptyRow filter={filter} onClear={() => filterSet('')} />
            )}
          </tbody>
        </table>
      </div>

      <div className='flex flex-wrap items-center gap-3 border-line border-t px-3 py-2'>
        <p className='text-[12px] text-dim tabular-nums'>
          showing {page.length} of {ordered.length}
        </p>

        {shown < ordered.length ? (
          <CommandButton
            className='ml-auto'
            onClick={() => setShown((count) => count + PAGE)}>
            show {Math.min(PAGE, ordered.length - shown)} more
          </CommandButton>
        ) : null}
      </div>
    </section>
  );
};

/**
 * Hidden is the exceptional state on this page — usually a handful out of 258 —
 * so it takes the accent and the marker rail, and a visible row stays quiet.
 */
const GameRow = (props: GameRowProps) => {
  const isHidden = Boolean(props.game.hidden);
  // Derived from the name, not carried in the payload: the rule is shared code,
  // so both sides reach the same answer without a field that could drift.
  const byRule = isNonGame(props.game.name);

  return (
    <tr
      className={`border-line/60 border-b transition-colors last:border-b-0 ${
        isHidden ? 'bg-bg-lift/40' : 'hover:bg-bg-soft'
      }`}>
      <td
        className={`hidden border-l-2 px-3 py-1.5 text-right text-[12px] text-dim tabular-nums sm:table-cell ${
          isHidden ? 'border-l-orange' : 'border-l-transparent'
        }`}>
        {props.index}
      </td>

      <td
        className={`border-l-2 px-3 py-1.5 sm:border-l-0 ${
          isHidden ? 'border-l-orange' : 'border-l-transparent'
        }`}>
        <span
          className={`block select-text truncate text-[13px] ${
            isHidden ? 'text-dim line-through' : 'text-fg-soft'
          }`}
          title={props.game.name}>
          {props.game.name}
        </span>
      </td>

      <td className='hidden px-3 py-1.5 sm:table-cell'>
        <PlatformBadge platform={props.game.platform} />
      </td>

      <td className='px-3 py-1.5 text-right'>
        <CommandButton
          ariaLabel={`${isHidden ? 'unhide' : 'hide'} ${props.game.name}`}
          className={`w-30 whitespace-nowrap px-2 text-left ${stateTone(isHidden, props.busy, byRule)}`}
          disabled={props.busy}
          onClick={props.onToggle}
          tone='bare'>
          {stateLabel(isHidden, props.busy, byRule)}
        </CommandButton>
      </td>
    </tr>
  );
};

/** The one row the table draws when nothing matched — never a bare border. */
const EmptyRow = (props: EmptyRowProps) => {
  return (
    <tr>
      <td className='px-3 py-12 text-center' colSpan={COLUMNS.length}>
        <p className='text-dim'>
          no title matches{' '}
          <span className='select-text text-fg-soft'>«{props.filter}»</span>
        </p>
        <CommandButton className='mt-3' onClick={props.onClear}>
          clear filter
        </CommandButton>
      </td>
    </tr>
  );
};

/**
 * Label plus input, in the app's own control language: an uppercase tracked
 * caption over the library's search-box frame. Local to /admin — it is the
 * only route with real forms on it.
 */
const Field = (props: FieldProps) => {
  return (
    <div className='flex flex-col gap-1.5'>
      <label
        className='flex items-baseline justify-between gap-2 text-[12px] text-mute uppercase tracking-[0.14em]'
        htmlFor={props.id}>
        {props.label}
        {props.suffix}
      </label>

      <input
        autoComplete={props.autoComplete}
        className='min-w-0 border border-line bg-bg-soft px-2 py-1.5 text-[13px] text-fg placeholder:text-dim focus:border-orange focus:outline-none'
        id={props.id}
        onChange={(event) => props.onChange(event.target.value)}
        placeholder={props.placeholder}
        spellCheck={props.spellCheck}
        type={props.type ?? 'text'}
        value={props.value}
      />
    </div>
  );
};

/** The header's link shape, for the two places /admin sends the owner off-site. */
const LinkOut = (props: LinkOutProps) => {
  return (
    <a
      className='text-orange underline transition-colors hover:text-yellow focus-visible:outline focus-visible:outline-orange'
      href={props.href}
      rel='noreferrer'
      target='_blank'>
      {props.children}
    </a>
  );
};

/**
 * One shape for every message the page can print, so an error and a success
 * differ by colour and glyph rather than by layout. The bracket glyph is the
 * checkbox's alphabet, reused rather than a second icon set.
 */
const Note = (props: NoteProps) => {
  return (
    <p
      className={`flex select-text items-baseline gap-2 border px-2 py-1 text-[12px] ${NOTE_TONE[props.tone]}`}
      role={props.tone === 'error' ? 'alert' : 'status'}>
      <span aria-hidden='true' className='shrink-0'>
        {NOTE_GLYPH[props.tone]}
      </span>
      {props.children}
    </p>
  );
};

/* Styles */

const NOTE_TONE = {
  error: 'border-red/40 bg-red/5 text-red',
  ok: 'border-green/40 bg-green/5 text-green',
} as const satisfies Record<NoteTone, string>;

const NOTE_GLYPH = {
  error: '[!]',
  ok: '[✓]',
} as const satisfies Record<NoteTone, string>;

/* Helpers */

/** Pending, signed in, signed out — one of three, never a guess. */
const screenPick = (
  session: ReturnType<typeof useAdminSession>,
  authed: boolean,
) => {
  if (session.isPending)
    return (
      <p className='flex flex-1 items-center justify-center text-dim'>
        checking session…
      </p>
    );
  if (authed) return <AdminPanel />;

  return <SignIn error={session.error?.message ?? null} />;
};

const npssoNote = (save: ReturnType<typeof useNpssoSave>) => {
  if (save.error) return <Note tone='error'>{save.error.message}</Note>;
  if (save.isSuccess)
    return <Note tone='ok'>token saved — the app is refetching with it.</Note>;

  return null;
};

/** Dim while typing, accent the moment the length guard is satisfied. */
const counterTone = (typed: number, isReady: boolean) => {
  if (isReady) return 'text-green';
  if (typed > NPSSO_LENGTH) return 'text-red';

  return 'text-dim';
};

/**
 * Three states, not two: a title hidden because the auto-hide rule matched its
 * name says «auto», so the owner can tell a rule from their own decision — and
 * knows the one press that overrules it.
 */
const stateLabel = (isHidden: boolean, busy: boolean, byRule: boolean) => {
  if (busy) return '[·] …';
  if (isHidden) return byRule ? '[x] auto' : '[x] hidden';

  return byRule ? '[ ] kept' : '[ ] visible';
};

/** «kept» is a decision the owner made against the rule, so it is not quiet. */
const stateTone = (isHidden: boolean, busy: boolean, byRule: boolean) => {
  if (busy) return 'text-yellow';
  if (isHidden) return 'text-orange hover:text-yellow';

  return byRule ? 'text-green hover:text-yellow' : '';
};

/** Lowercased alternatives from the filter box, `|`-separated. */
const needlesParse = (filter: string) =>
  filter
    .toLowerCase()
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

/** The nav's own copy — see the comment at the header. `/admin` is not listed
 *  anywhere on purpose: the route works, it is simply not advertised. */
const TABS = [
  { label: 'library', to: '/library' },
  { label: 'stats', to: '/stats' },
  { label: 'log', to: '/log' },
] as const;

/**
 * `w-40` on platform is the worst case measured, not a guess: `PS3 PSVITA PS4`
 * is three chips and runs ~133px, and at `w-24` it printed straight over the
 * state column.
 */
const COLUMNS = [
  { className: 'hidden w-11 text-right sm:table-cell', head: '#' },
  { className: 'text-left', head: 'title' },
  { className: 'hidden w-40 text-left sm:table-cell', head: 'platform' },
  { className: 'w-30 text-right', head: 'state' },
] as const;

const NPSSO_LENGTH = 64;
const PAGE = 60;

const SORT_OPTIONS = [
  { label: 'hidden first', value: 'hidden' },
  { label: 'library order', value: 'plain' },
] as const satisfies readonly { label: string; value: GameSort }[];

/**
 * Typing shortcuts: pressing one fills the filter box and nothing else.
 *
 * 📌 They used to be the ONLY way these titles got hidden, and this comment
 * used to say that no rule here ever decides on its own that a title is not a
 * game. `isNonGame` now does exactly that, on the same words — the presets
 * survive as the way to *see* the set the rule governs, and the per-row
 * override is what keeps the decision the owner's.
 */
const FILTER_PRESETS = [
  { filter: 'soundtrack', label: 'soundtracks' },
  { filter: 'artbook|art book', label: 'artbooks' },
] as const;

/* Types */

type GameSort = 'hidden' | 'plain';

type NoteTone = 'error' | 'ok';

interface AdminHeaderProps {
  authed: boolean;
}

interface SignInProps {
  error: string | null;
}

interface GameRowProps {
  busy: boolean;
  game: Game;
  /** 1-based position in the visible page, not an id. */
  index: number;
  onToggle: () => void;
}

interface EmptyRowProps {
  filter: string;
  onClear: () => void;
}

interface FieldProps {
  autoComplete?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  spellCheck?: boolean;
  /** Right-aligned caption on the label line — a character counter, say. */
  suffix?: ReactNode;
  type?: 'email' | 'password' | 'text';
  value: string;
}

interface LinkOutProps {
  children: ReactNode;
  href: string;
}

interface NoteProps {
  children: ReactNode;
  tone: NoteTone;
}
