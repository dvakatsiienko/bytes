import { useEffect, useRef } from 'react';
import { NumberField } from '@ui/kit/components/number-field';
import { cn } from 'cn';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { XIcon } from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import type { RingOpen, SummaryPart } from '../ring.ts';
import {
  edgeSummary,
  edges,
  findSettings,
  rowsOf,
  settingCount,
} from '../ring.ts';
import { useRoute } from '../route.ts';
import type { Settings } from '../stage/settings.ts';
import { defaults } from '../stage/settings.ts';
import {
  findAtom,
  findFocusAtom,
  patchSettingsAtom,
  settingsByPieceAtom,
} from '../state.ts';
import { Key } from './key';
import { SettingRow, handleRowKeys } from './setting-row';
import { CompareCard, TakePanel } from './take-view';

/**
 * The ring's four edges: folded, each is a chip naming its group and one
 * value; open, one of them holds every setting of its group. A flat piece has
 * only its seed, so its ring stays folded into one card.
 */
export const RingEdges = (props: RingEdgesProps) => {
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const patchSettings = useSetAtom(patchSettingsAtom);
  const update = (patch: Partial<Settings>) =>
    patchSettings(props.piece.id, patch);
  const open = props.actions.ring;

  if (!props.actions.isStage)
    return (
      <section aria-label='settings ring'>
        <FlatCard
          actions={props.actions}
          onChange={update}
          settings={settings}
        />
      </section>
    );

  const chipListJSX = [...edges]
    // the tab order reads the ring row by row: top, left, right, bottom
    .sort((a, b) => tabRow.indexOf(a.side) - tabRow.indexOf(b.side))
    .filter((edge) => edge.id !== open)
    // the film strip takes the bottom edge's place
    .filter((edge) => !(edge.side === 'bottom' && open === 'takes'))
    .map((edge) => {
      return (
        <EdgeChip
          edge={edge}
          key={edge.id}
          onPress={() => props.actions.toggleEdge(edge.id)}
          summary={edgeSummary(edge.id, settings)}
        />
      );
    });
  const openEdge = edges.find((edge) => edge.id === open);

  return (
    <section aria-label='settings ring'>
      {chipListJSX}
      {openEdge ? (
        <EdgePanel
          actions={props.actions}
          edge={openEdge}
          key={openEdge.id}
          onChange={update}
          settings={settings}
        />
      ) : null}
    </section>
  );
};

/**
 * A take's record or a compare's switch, under the top-right corner and
 * beside the lens chip; the open lens edge takes its place.
 */
export const SideCard = (props: SideCardProps) => {
  const { view } = useRoute();
  if (props.ring === 'lens' || view.kind === 'live') return null;
  return (
    <div className='glass absolute top-[calc(100%+12px)] right-[60px] flex max-h-[calc(100dvh-68px-var(--tr)-var(--br))] w-[300px] flex-col overflow-y-auto'>
      {view.kind === 'take' ? (
        <TakePanel piece={props.piece} />
      ) : (
        <CompareCard />
      )}
    </div>
  );
};

const EdgeChip = (props: EdgeChipProps) => {
  const isSide = props.edge.side === 'left' || props.edge.side === 'right';
  const name = props.edge.id;
  return (
    <button
      aria-expanded={false}
      aria-label={`${name}, ${rowsOf(props.edge.id).length} settings: ${props.summary.map((part) => part.text).join(' ')}`}
      className={cn(
        'glass absolute flex items-center justify-between',
        chipPlace[props.edge.side],
      )}
      data-ring-opener={props.edge.id}
      onClick={props.onPress}
      type='button'>
      <span
        className={cn(
          'font-semibold text-sm',
          isSide && '[writing-mode:vertical-rl]',
          props.edge.side === 'left' && 'rotate-180',
        )}>
        {name}
      </span>
      <span
        className={cn(
          'flex items-baseline gap-1.5 text-sm',
          isSide && '[writing-mode:vertical-rl]',
          props.edge.side === 'left' && 'rotate-180',
        )}>
        {props.summary.map((part) => {
          return part.isValue ? (
            <span
              className='font-mono text-[13px] tabular-nums'
              key={part.text}>
              {part.text}
            </span>
          ) : (
            <span key={part.text}>{part.text}</span>
          );
        })}
      </span>
      <span className={cn(isSide && '-order-1')}>
        <Key keys={props.edge.key} />
      </span>
    </button>
  );
};

/** the open edge: every setting of its group, or every setting the find words hit */
export const EdgePanel = (props: EdgePanelProps) => {
  const [query, setQuery] = useAtom(findAtom);
  const [findFocus, setFindFocus] = useAtom(findFocusAtom);
  const field = useRef<HTMLInputElement>(null);
  const isBand =
    props.isBand ?? (props.edge.side === 'top' || props.edge.side === 'bottom');
  const name = props.edge.id;
  const found = findSettings(query);
  const isFinding = query.trim() !== '';

  // `/` from anywhere lands here once; the first press also opens the edge
  useEffect(() => {
    if (findFocus === 0) return;
    field.current?.select();
    setFindFocus(0);
  }, [findFocus, setFindFocus]);

  const rowListJSX = isFinding
    ? found.map((hit) => {
        return (
          <SettingRow
            group={hit.group}
            key={hit.row.key}
            onChange={props.onChange}
            row={hit.row}
            settings={props.settings}
          />
        );
      })
    : rowsOf(props.edge.id).map((row) => {
        return (
          <SettingRow
            key={row.key}
            onChange={props.onChange}
            row={row}
            settings={props.settings}
          />
        );
      });

  const findJSX = (
    <div className={cn('flex items-center gap-2', isBand ? 'w-64' : '')}>
      <input
        aria-label='find a setting'
        className='h-8 min-w-0 flex-1 rounded-md border border-key-line bg-fill px-2.5 text-ink text-sm placeholder:text-ink-muted'
        id='setting-find'
        onChange={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            if (isFinding) setQuery('');
            else props.actions.foldRing();
          }
          if (event.key === 'Enter')
            event.currentTarget
              .closest('[data-ring-panel]')
              ?.querySelector<HTMLElement>(
                '[data-ring-row] input, [data-ring-row] button[role="switch"], [data-ring-row] button[data-slot="select-trigger"]',
              )
              ?.focus();
        }}
        placeholder={`find any of ${settingCount} settings`}
        ref={field}
        type='search'
        value={query}
      />
      <Key keys='/' />
    </div>
  );
  const toolsJSX = (
    <>
      <button
        className='flex items-center gap-1.5 rounded-md px-1 py-0.5 text-ink-muted text-sm hover:bg-fill-on hover:text-ink'
        onClick={props.actions.copySettings}
        type='button'>
        copy json <Key keys='y' />
      </button>
      <button
        className='flex items-center gap-1.5 rounded-md px-1 py-0.5 text-ink-muted text-sm hover:bg-fill-on hover:text-ink'
        onClick={props.actions.resetSettings}
        type='button'>
        reset <Key keys='r' />
      </button>
    </>
  );

  // on the ring an open top or bottom edge grows away from the piece, into the ground
  const slot = props.className || !isBand ? null : bandSlots[props.edge.side];
  const panelJSX = (
    <section
      aria-label={`${name} settings`}
      className={cn(
        'glass flex flex-col gap-3.5 px-4 pt-3 pb-3.5',
        slot
          ? bandHeights[props.edge.side]
          : `absolute ${panelPlace[props.edge.side]}`,
        props.className,
      )}
      data-ring-panel={props.edge.id}
      onKeyDownCapture={handleRowKeys}>
      <header className='flex flex-wrap items-center gap-2.5'>
        <h2 className='font-semibold text-sm'>{name}</h2>
        <Key keys={props.edge.key} />
        <span className='whitespace-nowrap text-ink-muted text-sm'>
          {isFinding
            ? `${found.length} found`
            : `${rowsOf(props.edge.id).length} settings`}
        </span>
        {isBand ? findJSX : null}
        <span className='flex-1' />
        {isBand ? toolsJSX : null}
        <button
          aria-label={`fold the ${name} edge`}
          className='flex items-center gap-1 rounded-md px-1 py-0.5 text-ink-muted hover:bg-fill-on hover:text-ink'
          onClick={props.actions.foldRing}
          type='button'>
          <XIcon className='size-3.5' />
          <Key keys='Escape' />
        </button>
      </header>
      {isBand ? null : findJSX}
      <div
        className={cn(
          // the padding holds the rows' focus rings, width + offset, so the scroll box never cuts one
          '-mx-2 -mt-2 -mb-3 min-h-0 overflow-y-auto px-2 pt-2 pb-5 [mask-image:linear-gradient(to_bottom,black_calc(100%-20px),transparent)]',
          isBand
            ? 'grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-6 gap-y-4'
            : 'flex flex-col gap-3',
        )}>
        {rowListJSX}
        {isFinding && found.length === 0 ? (
          <p className='text-ink-muted text-sm'>
            no setting is called «{query.trim()}»
          </p>
        ) : null}
      </div>
      {isBand ? null : (
        <footer className='flex flex-col gap-2.5'>
          <p className='flex items-center gap-2 whitespace-nowrap text-ink-muted text-sm'>
            <Key keys='↑↓' /> row <Key keys='←→' /> value
          </p>
          <div className='flex items-center justify-between'>{toolsJSX}</div>
        </footer>
      )}
    </section>
  );
  if (!slot) return panelJSX;
  return (
    <div
      className={cn(
        'absolute right-[332px] left-[332px] flex min-h-min flex-col',
        slot,
      )}>
      {panelJSX}
    </div>
  );
};

/** a flat piece is its svg: of every setting only the seed reaches it */
export const FlatCard = (props: FlatCardProps) => {
  return (
    <section
      aria-label='seed'
      className={cn(
        'glass absolute top-4 left-1/2 flex w-[min(520px,calc(100%-664px))] -translate-x-1/2 flex-col gap-3 px-4 py-3.5',
        props.className,
      )}>
      <p className='text-sm'>
        a flat piece has only its seed. light, lens and atmosphere belong to lit
        scenes, so the ring stays folded.
      </p>
      <div className='flex flex-wrap items-center gap-2'>
        <label className='text-ink-muted text-sm' htmlFor='setting-seed'>
          seed
        </label>
        <NumberField
          className='h-8 w-24 border-key-line bg-fill font-mono text-[12px] text-ink tabular-nums'
          id='setting-seed'
          max={9999}
          min={1}
          onValueChange={(seed) => props.onChange({ seed })}
          step={1}
          value={props.settings.seed}
        />
        <button
          className='flex h-8 items-center gap-1.5 rounded-md bg-fill px-2 text-sm hover:bg-fill-on'
          onClick={props.actions.newSeed}
          type='button'>
          new seed <Key keys='e' />
        </button>
        <span className='flex-1' />
        <button
          className='flex items-center gap-1.5 rounded-md px-1 py-0.5 text-ink-muted text-sm hover:bg-fill-on hover:text-ink'
          onClick={props.actions.copySettings}
          type='button'>
          copy json <Key keys='y' />
        </button>
      </div>
    </section>
  );
};

/* Helpers */

const tabRow = ['top', 'left', 'right', 'bottom'] as const;

/** where each folded edge sits: the top and bottom ones in the ground beside the art, the side ones between the corners */
const chipPlace = {
  bottom:
    'bottom-[var(--chip-inset)] left-1/2 h-12 w-[300px] -translate-x-1/2 px-3.5',
  left: 'top-[calc(50%+(var(--tl)-var(--bl))/2)] left-4 h-60 w-12 -translate-y-1/2 flex-col py-3',
  right:
    'top-[calc(50%+(var(--tr)-var(--br))/2)] right-4 h-60 w-12 -translate-y-1/2 flex-col py-3',
  top: 'top-[var(--chip-inset)] left-1/2 h-12 w-[300px] -translate-x-1/2 px-3.5',
} as const;

/** where each open edge sits: a band between the top or bottom corners, a column under a side corner */
const panelPlace = {
  bottom:
    'bottom-[var(--chip-inset)] left-[332px] right-[332px] max-h-[calc(100%-28px-var(--chip-inset)-max(var(--tl),var(--tr)))]',
  left: 'top-[calc(28px+var(--tl))] left-4 w-[300px] max-h-[calc(100%-56px-var(--tl)-var(--bl))]',
  right:
    'top-[calc(28px+var(--tr))] right-4 w-[300px] max-h-[calc(100%-56px-var(--tr)-var(--br))]',
  top: 'top-[var(--chip-inset)] left-[332px] right-[332px] max-h-[calc(100%-28px-var(--chip-inset)-max(var(--bl),var(--br)))]',
} as const;

/**
 * An open top or bottom edge sits in a slot from the window's edge to 12 px
 * short of the piece's rim, against the rim side: when the ground beside the
 * art has room for it, the panel covers none of the art. A panel taller than
 * the slot stretches it (min-content) from the window's edge, so it reaches
 * into the art only as far as its own height forces.
 */
const bandSlots: Partial<Record<Side, string>> = {
  bottom: 'bottom-4 justify-start h-[max(0px,calc(var(--art-top,0px)-28px))]',
  top: 'top-4 justify-end h-[max(0px,calc(var(--art-top,0px)-28px))]',
};

/** a band never reaches the corners across from it */
const bandHeights: Partial<Record<Side, string>> = {
  bottom: 'max-h-[calc(100cqh-44px-max(var(--tl),var(--tr)))]',
  top: 'max-h-[calc(100cqh-44px-max(var(--bl),var(--br)))]',
};

/* Types */

type Side = (typeof edges)[number]['side'];

interface RingEdgesProps {
  actions: StudioActions;
  piece: Piece;
}

interface SideCardProps {
  piece: Piece;
  ring: RingOpen;
}

interface EdgeChipProps {
  edge: (typeof edges)[number];
  onPress: () => void;
  summary: readonly SummaryPart[];
}

interface EdgePanelProps {
  actions: StudioActions;
  /** where it sits, over the ring's own place for its side */
  className?: string;
  edge: (typeof edges)[number];
  /** a band lays its rows out in columns; by default the top and bottom edges are bands */
  isBand?: boolean;
  onChange: (patch: Partial<Settings>) => void;
  settings: Settings;
}

interface FlatCardProps {
  actions: StudioActions;
  className?: string;
  onChange: (patch: Partial<Settings>) => void;
  settings: Settings;
}
