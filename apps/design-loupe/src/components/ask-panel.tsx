import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { Input } from '@ui/kit/components/input';
import { Kbd } from '@ui/kit/components/kbd';
import { cn } from 'cn';
import {
  CheckIcon,
  CornerDownLeftIcon,
  MapPinOffIcon,
  SearchIcon,
} from 'lucide-react';

import type { AskView, BoardView, JobView } from '../../server/job.ts';
import { useAnswer, useReopen } from '@/api.ts';
import type { Route } from '@/route.ts';
import {
  askIdOf,
  askPath,
  boardPath,
  handleLinkClick,
  navigate,
} from '@/route.ts';
import { stepAsk } from '@/view.ts';

/**
 * The round's asks, one open at a time. Keys: `1`–`9` pick an option, Enter
 * takes the recommendation, `j` / `k` move between asks; in the note line,
 * Enter adds the note. A question is text to read, copy or have read aloud,
 * so it is never inside a link: only an ask's header line and its board line
 * jump the view.
 */
export const AskPanel = (props: AskPanelProps) => {
  const answer = useAnswer();
  const askId = askIdOf(props.target);
  const active = props.job.asks.find((ask) => ask.id === askId);

  const pick = (ask: AskView, index: number) => {
    if (index < ask.options.length)
      answer.mutate({ id: ask.id, note: '', pick: index });
  };
  const keysRef = useRef({
    active,
    asks: props.job.asks,
    job: props.job.name,
    pick,
  });
  keysRef.current = { active, asks: props.job.asks, job: props.job.name, pick };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      // a held key repeats; one press is one answer
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (isTyping(event.target)) return;
      const keys = keysRef.current;
      if (event.key === 'j' || event.key === 'k') {
        const next = stepAsk(
          keys.asks,
          keys.active?.id,
          event.key === 'j' ? 1 : -1,
        );
        if (next) navigate(askPath(keys.job, next));
        return;
      }
      if (!keys.active) return;
      if (OPTION_KEY.test(event.key)) {
        keys.pick(keys.active, Number(event.key) - 1);
        return;
      }
      // a focused link or button answers Enter itself; only an Enter with nothing in focus answers
      if (event.key === 'Enter' && !isControl(event.target)) {
        const ask = keys.active;
        if (ask.state === 'open' && ask.recommend !== undefined)
          keys.pick(ask, ask.recommend);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const askListJSX = props.job.asks.map((ask) => {
    const isActive = ask.id === active?.id;
    return (
      <li
        className={cn(
          'border-l-2',
          isActive ? 'border-loupe bg-muted/40' : 'border-transparent',
        )}
        key={ask.id}>
        <AskLink
          ask={ask.id}
          className='flex items-center gap-2 px-5 pt-3 pb-1 text-muted-foreground text-xs hover:text-foreground'
          isCurrent={isActive}
          job={props.job.name}>
          <span className='font-mono'>{ask.id}</span>
          <StateChip ask={ask} />
        </AskLink>
        <p
          className={cn(
            'select-text px-5 pb-3 text-sm',
            isActive ? 'font-medium' : 'line-clamp-2',
          )}>
          {ask.question}
        </p>
        {isActive ? (
          <AskDetail
            ask={ask}
            board={props.job.boards.find((board) => board.file === ask.board)}
            // a failed save shows on the ask it was for, never on the next one
            error={answer.variables?.id === ask.id ? answer.error : null}
            isSaving={answer.isPending}
            job={props.job.name}
            onNote={(note) => answer.mutate({ id: ask.id, note, pick: null })}
            onPick={(index) => pick(ask, index)}
          />
        ) : null}
      </li>
    );
  });

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <header className='flex items-center gap-3 border-b px-5 py-3'>
        <a
          className='flex items-center gap-1.5 rounded-md font-semibold text-base hover:text-loupe'
          href='/'
          onClick={handleLinkClick}>
          <SearchIcon
            aria-hidden
            className='size-4 text-loupe'
            strokeWidth={2.5}
          />
          loupe
        </a>
        <h1
          className='min-w-0 truncate font-normal text-muted-foreground text-sm'
          title={props.job.title}>
          {props.job.title}
        </h1>
        <span className='ml-auto shrink-0 text-muted-foreground text-xs tabular-nums'>
          round {props.job.round}
        </span>
      </header>
      {active ? null : (
        <div className='border-b px-5 py-4 text-muted-foreground text-sm'>
          <RoundSummary asks={props.job.asks.length} open={props.openCount} />
        </div>
      )}
      <ol className='min-h-0 flex-1 overflow-y-auto py-1'>{askListJSX}</ol>
      <footer className='flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-5 py-2.5 text-muted-foreground text-xs'>
        <span>
          <Kbd>1</Kbd>–<Kbd>9</Kbd> pick
        </span>
        <span>
          <Kbd>
            <CornerDownLeftIcon />
          </Kbd>{' '}
          recommended
        </span>
        <span>
          <Kbd>j</Kbd> <Kbd>k</Kbd> next, previous
        </span>
        <span>
          <Kbd>esc</Kbd> back to panning
        </span>
      </footer>
    </div>
  );
};

const AskDetail = (props: AskDetailProps) => {
  const reopen = useReopen();
  const [line, setLine] = useState('');
  const picked = props.ask.answer?.pick ?? null;

  const optionListJSX = props.ask.options.map((option, index) => {
    const isPicked = picked === index;
    return (
      <li key={option}>
        <Button
          aria-pressed={isPicked}
          className='h-auto w-full justify-start gap-2.5 whitespace-normal py-2 text-left'
          disabled={props.isSaving}
          onClick={() => props.onPick(index)}
          variant={isPicked ? 'default' : 'outline'}>
          <Kbd
            className={
              isPicked ? 'bg-primary-foreground/20 text-primary-foreground' : ''
            }>
            {index + 1}
          </Kbd>
          <span className='flex-1'>{option}</span>
          {index === props.ask.recommend ? (
            <span
              className={cn(
                'shrink-0 text-xs',
                isPicked ? 'text-primary-foreground/80' : 'text-loupe',
              )}>
              recommended
            </span>
          ) : null}
        </Button>
      </li>
    );
  });

  const noteListJSX = (props.ask.answer?.notes ?? []).map((note) => {
    return (
      <li className='text-sm' key={note.at}>
        <time
          className='mr-2 text-muted-foreground text-xs tabular-nums'
          dateTime={note.at}>
          {clockOf(note.at)}
        </time>
        <span className='select-text'>{note.text}</span>
      </li>
    );
  });

  const statusJSX = (() => {
    switch (props.ask.state) {
      case 'open':
        return null;
      case 'answered':
        return <span>answered — waiting for the designer</span>;
      case 'seen':
        return <span>seen by the designer</span>;
      case 'applied':
        return (
          <span>
            applied in{' '}
            <a
              className='font-medium text-foreground underline'
              href={
                props.board ? boardPath(props.job, props.board.name) : undefined
              }
              onClick={handleLinkClick}>
              {props.ask.applied?.in}
            </a>
          </span>
        );
      default:
        return props.ask.state satisfies never;
    }
  })();

  return (
    <div className='flex flex-col gap-3 px-5 pb-4'>
      <AskLink
        ask={props.ask.id}
        className='-mt-1 self-start text-muted-foreground text-xs underline-offset-2 hover:text-foreground hover:underline'
        isCurrent={false}
        job={props.job}>
        on {props.board?.title ?? props.ask.board}
      </AskLink>
      {props.ask.isMoved ? (
        <p
          className='flex gap-2 rounded-md border border-dashed px-3 py-2 text-sm'
          role='status'>
          <MapPinOffIcon aria-hidden className='mt-0.5 size-4 shrink-0' />
          <span>
            <span className='font-medium'>target moved</span> — the pinned
            element is gone from this board's current version, so the view shows
            the whole board
          </span>
        </p>
      ) : null}
      {props.ask.options.length > 0 ? (
        <ol className='flex flex-col gap-1.5'>{optionListJSX}</ol>
      ) : null}
      {props.ask.why ? (
        <p className='text-muted-foreground text-sm'>
          <span className='text-foreground'>why the recommendation:</span>{' '}
          {props.ask.why}
        </p>
      ) : null}
      {noteListJSX.length > 0 ? (
        <ol aria-label='notes' className='flex flex-col gap-1.5 border-l pl-3'>
          {noteListJSX}
        </ol>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (line.trim() === '') return;
          props.onNote(line);
          setLine('');
        }}>
        <Input
          aria-label={`add a note to ${props.ask.id}`}
          disabled={props.isSaving}
          onChange={(event) => setLine(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.currentTarget.blur();
          }}
          placeholder={
            props.ask.options.length > 0
              ? 'add a note — Enter sends, the pick stays'
              : 'your answer — Enter sends'
          }
          value={line}
        />
      </form>
      {props.error ? (
        <p className='text-destructive text-sm' role='alert'>
          {props.error.message}
        </p>
      ) : null}
      {statusJSX ? (
        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
          {statusJSX}
          <Button
            className='ml-auto'
            disabled={reopen.isPending}
            onClick={() => reopen.mutate(props.ask.id)}
            size='sm'
            variant='ghost'>
            reopen
          </Button>
        </div>
      ) : null}
    </div>
  );
};

/** a jump to an ask's spot; the open ask clicked again frames its board again, after a pan */
const AskLink = (props: AskLinkProps) => {
  return (
    <a
      aria-current={props.isCurrent ? 'true' : undefined}
      className={cn(
        'rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        props.className,
      )}
      draggable={false}
      href={askPath(props.job, props.ask)}
      // a pointer click lets go of the focus, so the next Enter answers the ask instead of following the link again
      onClick={(event) => {
        handleLinkClick(event);
        if (event.detail > 0) event.currentTarget.blur();
      }}>
      {props.children}
    </a>
  );
};

/** the panel's default with no ask open: what is left, or that nothing is */
const RoundSummary = (props: { asks: number; open: number }) => {
  if (props.asks === 0) return <p>no asks in this round yet</p>;
  if (props.open === 0)
    return (
      <p>
        <CheckIcon aria-hidden className='mr-1 inline size-4 text-loupe' />
        every ask is answered — the designer wakes on each one
      </p>
    );
  return (
    <p>
      {props.open} open {props.open === 1 ? 'ask' : 'asks'} — press <Kbd>j</Kbd>{' '}
      to start
    </p>
  );
};

const StateChip = (props: { ask: AskView }) => {
  if (props.ask.isMoved && props.ask.state === 'open')
    return (
      <span className='rounded-sm border border-dashed px-1.5'>
        target moved
      </span>
    );
  const label =
    props.ask.state === 'applied'
      ? `applied in ${props.ask.applied?.in}`
      : props.ask.state;
  return (
    <span
      className={cn(
        'rounded-sm px-1.5',
        props.ask.state === 'open'
          ? 'bg-loupe font-medium text-loupe-ink'
          : 'bg-muted text-foreground',
      )}>
      {label}
    </span>
  );
};

/* Helpers */

const OPTION_KEY = /^[1-9]$/;

const clockOf = (at: string) =>
  new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const isControl = (target: EventTarget | null) =>
  target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLElement && target.isContentEditable);

/* Types */

interface AskPanelProps {
  job: JobView;
  openCount: number;
  target: Route;
}

interface AskDetailProps {
  ask: AskView;
  board: BoardView | undefined;
  error: Error | null;
  isSaving: boolean;
  /** the job's name, the first segment of every link */
  job: string;
  onNote: (note: string) => void;
  onPick: (index: number) => void;
}

interface AskLinkProps {
  ask: string;
  children: ReactNode;
  className: string;
  isCurrent: boolean;
  job: string;
}
