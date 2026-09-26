import type { ReactNode } from 'react';
import { Button } from '@ui/kit/components/button';
import { cn } from 'cn';
import { LampDeskIcon, RotateCcwIcon } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { errorText } from '../error-text.ts';
import { pathOf, useRoute } from '../route.ts';

/**
 * One region of the studio that fails alone: its fallback stays in its own
 * box, the other sections keep working, and moving to another view clears it.
 */
export const Section = (props: SectionProps) => {
  const path = pathOf(useRoute());
  return (
    <ErrorBoundary
      fallbackRender={(fallback) => {
        return (
          <SectionFallback
            {...fallback}
            box={sections[props.name].box}
            isRow={sections[props.name].isRow}
            what={sections[props.name].what}
          />
        );
      }}
      // only the button ends a test crash; a new route (resetKeys) keeps it throwing
      onReset={(details) => {
        if (details.reason === 'imperative-api') retried.add(props.name);
      }}
      resetKeys={[path]}>
      {/* keyed by the path: the compiler keeps an element whose props never change, so only a remount reads the new url */}
      <DevCrash key={path} section={props.name} />
      {props.children}
    </ErrorBoundary>
  );
};

/** the last net, when a render fails outside every section */
export const RootFallback = (props: FallbackProps) => {
  return (
    <div
      className='grid h-dvh place-items-center bg-background p-6 text-foreground'
      role='alert'>
      <div className='flex max-w-lg flex-col gap-3'>
        <h1 className='font-serif text-2xl'>atelier stopped drawing</h1>
        <p className='select-all font-mono text-[12px] text-muted-foreground'>
          {errorText(props.error)}
        </p>
        <Button
          className='self-start'
          onClick={() => location.reload()}
          size='sm'
          variant='outline'>
          reload the studio
        </Button>
      </div>
    </div>
  );
};

const SectionFallback = (props: SectionFallbackProps) => {
  if (props.isRow)
    return (
      <div
        className='flex h-full min-h-0 min-w-0 items-center gap-2 text-muted-foreground text-sm'
        role='alert'>
        <LampDeskIcon aria-hidden className='size-4 shrink-0' />
        <p
          className='truncate'
          // a one-row section has no room for the disclosure: in dev the error is its hover text
          title={isDev ? errorText(props.error) : undefined}>
          {props.what} stopped drawing
        </p>
        <Button onClick={props.resetErrorBoundary} size='sm' variant='ghost'>
          <RotateCcwIcon /> try again
        </Button>
      </div>
    );

  return (
    <div
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 overflow-auto p-6 text-center',
        props.box,
      )}
      role='alert'>
      <span className='grid size-10 place-items-center rounded-full bg-chip text-muted-foreground'>
        <LampDeskIcon aria-hidden className='size-5' />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='font-serif text-foreground text-lg leading-tight'>
          {props.what} stopped drawing
        </p>
        <p className='text-muted-foreground text-sm'>
          the rest of the studio still works
        </p>
      </div>
      <Button onClick={props.resetErrorBoundary} size='sm' variant='outline'>
        <RotateCcwIcon /> try again
      </Button>
      {isDev ? (
        <details className='w-full max-w-md text-left text-muted-foreground'>
          <summary className='cursor-pointer text-center text-[12px]'>
            what broke
          </summary>
          <pre className='mt-2 max-h-40 select-all overflow-auto whitespace-pre-wrap rounded-lg bg-chip p-3 font-mono text-[12px] text-foreground'>
            {errorText(props.error)}
          </pre>
        </details>
      ) : null}
    </div>
  );
};

/**
 * Dev only: `?crash=<section>` throws in that section until «try again», so
 * its fallback shows, the others can be clicked, and the retry brings it back.
 * It must keep throwing: react retries a failed render once before a boundary
 * catches it.
 */
const DevCrash = (props: { section: SectionName }) => {
  if (
    isDev &&
    !retried.has(props.section) &&
    new URLSearchParams(location.search).get('crash') === props.section
  )
    throw new Error(`?crash=${props.section}: a test crash`);
  return null;
};

/* Helpers */

// biome-ignore lint/suspicious/noUndeclaredEnvVars: vite's own build flag, never read from the shell
const isDev = import.meta.env.DEV;

const retried = new Set<SectionName>();

/**
 * each section, the words its fallback uses, and the box it keeps: header and
 * toolbar are one row high; the takes list holds at most its capped share of
 * the rail, the pieces list the rest
 */
const sections = {
  header: { box: '', isRow: true, what: 'the header tools' },
  panel: { box: 'h-full', isRow: false, what: 'the side panel' },
  pieces: {
    box: 'min-h-0 flex-1 border-border border-b',
    isRow: false,
    what: 'the pieces list',
  },
  takes: { box: 'max-h-[45%] shrink-0', isRow: false, what: 'the takes list' },
  toolbar: { box: '', isRow: true, what: 'the bench tools' },
  viewport: { box: 'h-full', isRow: false, what: 'the piece' },
} as const satisfies Record<
  string,
  { box: string; isRow: boolean; what: string }
>;

/* Types */

type SectionName = keyof typeof sections;

interface SectionProps {
  children: ReactNode;
  name: SectionName;
}

interface SectionFallbackProps extends FallbackProps {
  box: string;
  isRow: boolean;
  what: string;
}
