import { useState } from 'react';
import { Button, buttonVariants } from '@ui/kit/components/button';
import { Input } from '@ui/kit/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@ui/kit/components/popover';
import { Textarea } from '@ui/kit/components/textarea';
import { useAtom, useSetAtom } from 'jotai';
import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  GitCompareIcon,
  SlidersHorizontalIcon,
  StarIcon,
} from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import type { Take, TakeList } from '../../server/takes.ts';
import { useRoute } from '../route.ts';
import { stashFormAtom, zoomAtom } from '../state.ts';
import { useTakeActions } from '../take-actions.ts';
import { takeUrl, useTakes } from '../takes.ts';

/** the webp a take baked; a click opens it in the zoom */
export const TakeImage = (props: TakeImageProps) => {
  const setZoom = useSetAtom(zoomAtom);
  const aspectRatio = `${props.piece.size.w} / ${props.piece.size.h}`;
  return (
    <button
      aria-label={`zoom into take ${props.take.id}`}
      className='block w-full cursor-zoom-in'
      onClick={() =>
        setZoom({
          alt: `${props.piece.title}, take ${props.take.id}`,
          src: takeUrl(props.take),
        })
      }
      type='button'>
      <img
        alt={`${props.piece.title}, take ${props.take.id}`}
        className='block h-auto w-full'
        data-rendered={`${props.take.piece}:${props.take.id}`}
        height={props.piece.size.h}
        src={takeUrl(props.take)}
        style={{ aspectRatio }}
        width={props.piece.size.w}
      />
    </button>
  );
};

/** the take on screen, beside the canvas so its actions never scroll away; nothing on the live view */
export const TakePanel = (props: { piece: Piece }) => {
  const { view } = useRoute();
  const list = useTakes(props.piece.id).data;
  const take =
    view.kind === 'take'
      ? list?.takes.find((candidate) => candidate.id === view.take)
      : undefined;
  return list && take ? <TakeRecord list={list} take={take} /> : null;
};

/** everything that makes a take reproducible, and what can be done to it */
const TakeRecord = (props: TakeRecordProps) => {
  const actions = useTakeActions();
  const isCurrent = props.list.current[props.take.time] === props.take.id;
  const others = props.list.takes.filter((take) => take.id !== props.take.id);
  const facts = [
    ['time', props.take.time],
    ['seed', String(props.take.seed)],
    [
      'frames',
      props.take.frames > 1 ? `${props.take.frames}, looping` : 'still',
    ],
    ['source', props.take.sourceHash],
    ['baked', new Date(props.take.bakedAt).toLocaleString()],
  ] as const;

  const factListJSX = facts.map(([label, value]) => {
    return (
      <div className='flex flex-col last:col-span-2' key={label}>
        <dt className='text-[12px] text-muted-foreground'>{label}</dt>
        <dd className='select-all break-all font-mono text-[12px]'>{value}</dd>
      </div>
    );
  });

  const compareListJSX = others.map((other) => {
    return (
      <li key={other.id}>
        <button
          className='w-full rounded-sm px-2 py-1 text-left font-mono text-[12px] hover:bg-accent'
          onClick={() => actions.compare(props.take, other)}
          type='button'>
          {other.id}
        </button>
      </li>
    );
  });

  return (
    <section
      aria-label={`take ${props.take.id}`}
      className='flex shrink-0 flex-col gap-3 border-border border-b px-4 py-3'>
      <header className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <h2 className='font-serif text-lg'>{props.take.id}</h2>
        {isCurrent ? (
          <span className='text-muted-foreground text-sm'>
            the current {props.take.time} take
          </span>
        ) : null}
      </header>
      <dl className='grid grid-cols-2 gap-x-3 gap-y-2'>{factListJSX}</dl>
      <NoteField
        key={props.take.id}
        onSave={(note) => actions.saveNote(props.take, note)}
        value={props.take.note}
      />
      {props.take.stash ? (
        <div className='flex flex-col gap-1 rounded-md bg-chip p-3 text-sm'>
          <p>
            <span className='text-muted-foreground'>good: </span>
            {props.take.stash.good}
          </p>
          <p>
            <span className='text-muted-foreground'>not yet: </span>
            {props.take.stash.notYet}
          </p>
        </div>
      ) : null}
      <div className='flex flex-wrap gap-1.5'>
        <Button
          disabled={isCurrent}
          onClick={() => actions.promote(props.take)}
          size='sm'
          variant='outline'>
          <StarIcon /> promote
        </Button>
        {props.take.stash ? (
          <Button
            onClick={() => actions.unstash(props.take)}
            size='sm'
            variant='outline'>
            <ArchiveIcon /> unstash
          </Button>
        ) : (
          <StashForm key={props.take.id} take={props.take} />
        )}
        <Popover>
          <PopoverTrigger
            disabled={others.length === 0}
            render={<Button size='sm' variant='outline' />}>
            <GitCompareIcon /> compare…
          </PopoverTrigger>
          <PopoverContent align='start' className='w-56 p-1'>
            <PopoverTitle className='px-2 py-1 text-muted-foreground text-xs'>
              compare {props.take.id} with
            </PopoverTitle>
            <ul className='max-h-64 overflow-y-auto'>{compareListJSX}</ul>
          </PopoverContent>
        </Popover>
        <Button
          onClick={() => actions.loadSettings(props.take)}
          size='sm'
          variant='outline'>
          <SlidersHorizontalIcon /> use its settings
        </Button>
        <Button
          onClick={() => actions.copyImage(props.take)}
          size='sm'
          variant='outline'>
          <CopyIcon /> copy png
        </Button>
      </div>
      <div className='flex items-center gap-1'>
        <span className='mr-1 text-[12px] text-muted-foreground'>download</span>
        <a
          className={buttonVariants({ size: 'sm', variant: 'ghost' })}
          download={`${props.take.piece}-${props.take.id}.webp`}
          href={takeUrl(props.take)}>
          <DownloadIcon /> webp
        </a>
        <a
          className={buttonVariants({ size: 'sm', variant: 'ghost' })}
          href={takeUrl(props.take, 'bake.avif')}>
          <DownloadIcon /> avif
        </a>
        {props.take.files.includes('piece.svg') ? (
          <a
            className={buttonVariants({ size: 'sm', variant: 'ghost' })}
            download={`${props.take.piece}-${props.take.id}.svg`}
            href={takeUrl(props.take, 'piece.svg')}>
            <DownloadIcon /> svg
          </a>
        ) : null}
      </div>
    </section>
  );
};

const NoteField = (props: {
  value: string;
  onSave: (note: string) => void;
}) => {
  const [draft, setDraft] = useState(props.value);
  const save = () => {
    if (draft.trim() !== props.value) props.onSave(draft.trim());
  };
  return (
    <div className='flex flex-col gap-1'>
      <label className='text-[12px] text-muted-foreground' htmlFor='take-note'>
        note
      </label>
      <Input
        id='take-note'
        maxLength={200}
        onBlur={save}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') save();
        }}
        placeholder='one line: what this take tries'
        value={draft}
      />
    </div>
  );
};

/** a take is stashed with two reasons, so it can come back later for the right job */
const StashForm = (props: { take: Take }) => {
  const actions = useTakeActions();
  const [openFor, setOpenFor] = useAtom(stashFormAtom);
  const [good, setGood] = useState('');
  const [notYet, setNotYet] = useState('');
  const isOpen = openFor === props.take.id;

  return (
    <Popover
      onOpenChange={(open) => setOpenFor(open ? props.take.id : null)}
      open={isOpen}>
      <PopoverTrigger render={<Button size='sm' variant='outline' />}>
        <ArchiveIcon /> stash…
      </PopoverTrigger>
      <PopoverContent align='start' className='w-80'>
        <form
          className='flex flex-col gap-3'
          onSubmit={(event) => {
            event.preventDefault();
            actions.stash(props.take, good.trim(), notYet.trim());
            setOpenFor(null);
          }}>
          <PopoverTitle>stash {props.take.id}</PopoverTitle>
          <div className='flex flex-col gap-1 text-sm'>
            <label htmlFor='stash-good'>what is good about it</label>
            <Textarea
              id='stash-good'
              maxLength={400}
              onChange={(event) => setGood(event.currentTarget.value)}
              required
              value={good}
            />
          </div>
          <div className='flex flex-col gap-1 text-sm'>
            <label htmlFor='stash-not-yet'>why it does not fit yet</label>
            <Textarea
              id='stash-not-yet'
              maxLength={400}
              onChange={(event) => setNotYet(event.currentTarget.value)}
              required
              value={notYet}
            />
          </div>
          <Button size='sm' type='submit'>
            stash it
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

/* Types */

interface TakeImageProps {
  piece: Piece;
  take: Take;
}

interface TakeRecordProps {
  list: TakeList;
  take: Take;
}
