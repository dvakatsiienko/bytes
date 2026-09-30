import type { ReactNode } from 'react';
import { Button } from '@ui/kit/components/button';
import { cn } from 'cn';
import { LampDeskIcon, RotateCcwIcon } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { devCrash, endDevCrash, isDev } from '../dev-crash.ts';
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
        if (details.reason === 'imperative-api') endDevCrash();
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
    <main className='grid h-dvh place-items-center bg-ground p-6 text-ink'>
      <div className='glass flex max-w-lg flex-col gap-3 p-6' role='alert'>
        <h1 className='font-semibold text-2xl'>atelier stopped drawing</h1>
        <p className='select-all font-mono text-[12px] text-ink-muted'>
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
    </main>
  );
};

const SectionFallback = (props: SectionFallbackProps) => {
  if (props.isRow)
    return (
      <div
        className={cn(
          'glass flex min-h-0 min-w-0 items-center gap-2 p-2 text-ink-muted text-sm',
          props.box,
        )}
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
        'glass flex min-h-40 flex-col items-center justify-center gap-3 overflow-auto p-6 text-center',
        props.box,
      )}
      role='alert'>
      <span className='grid size-10 place-items-center rounded-full bg-fill text-ink-muted'>
        <LampDeskIcon aria-hidden className='size-5' />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='font-semibold text-base text-ink leading-tight'>
          {props.what} stopped drawing
        </p>
        <p className='text-ink-muted text-sm'>
          the rest of the studio still works
        </p>
      </div>
      <Button onClick={props.resetErrorBoundary} size='sm' variant='outline'>
        <RotateCcwIcon /> try again
      </Button>
      {isDev ? (
        <details className='w-full max-w-md text-left text-ink-muted'>
          <summary className='cursor-pointer text-center text-sm'>
            what broke
          </summary>
          <pre className='mt-2 max-h-40 select-all overflow-auto whitespace-pre-wrap rounded-lg bg-fill p-3 font-mono text-[12px] text-ink'>
            {errorText(props.error)}
          </pre>
        </details>
      ) : null}
    </div>
  );
};

/** `?crash=<section>` lands in the section's own box: the others can be clicked, the retry brings it back */
const DevCrash = (props: { section: SectionName }) => {
  devCrash(props.section);
  return null;
};

/* Helpers */

/**
 * each section, the words its fallback uses, and the box it keeps on the ring:
 * the corners are one row inside their card's place (the pieces card leaves
 * the wordmark its first row), the edges fall back to one card at the top
 * centre, the piece to the whole screen
 */
const sections = {
  header: { box: '', isRow: true, what: 'the view tools' },
  panel: {
    box: 'pointer-events-auto mx-auto mt-4 w-[300px] max-w-full',
    isRow: false,
    what: 'the ring',
  },
  pieces: { box: 'px-3.5 pt-11 pb-3', isRow: true, what: 'the pieces list' },
  takes: { box: 'w-[300px] max-w-full', isRow: false, what: 'the takes' },
  toolbar: { box: '', isRow: true, what: 'the bench tools' },
  viewport: {
    box: 'absolute inset-0 m-auto h-fit w-fit',
    isRow: false,
    what: 'the piece',
  },
} as const satisfies Record<
  string,
  { box: string; isRow: boolean; what: string }
>;

/* Types */

export type SectionName = keyof typeof sections;

interface SectionProps {
  children: ReactNode;
  name: SectionName;
}

interface SectionFallbackProps extends FallbackProps {
  box: string;
  isRow: boolean;
  what: string;
}
