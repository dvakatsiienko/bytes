import type { ReactNode } from 'react';
import { Button } from '@ui/kit/components/button';
import { cn } from 'cn';
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
            isRow={sections[props.name].isRow}
            what={sections[props.name].what}
          />
        );
      }}
      onReset={() => retried.add(props.name)}
      resetKeys={[path]}>
      <DevCrash section={props.name} />
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
  return (
    <div
      className={cn(
        'flex min-h-0 gap-2 p-4 text-sm',
        props.isRow
          ? 'h-full flex-row items-center py-0'
          : 'h-full flex-col items-start justify-center',
      )}
      role='alert'>
      <p className='text-foreground'>{props.what} stopped drawing</p>
      <Button onClick={props.resetErrorBoundary} size='sm' variant='outline'>
        try again
      </Button>
      {isDev && !props.isRow ? (
        <details className='max-w-full text-muted-foreground'>
          <summary className='cursor-pointer text-[12px]'>what broke</summary>
          <pre className='select-all whitespace-pre-wrap font-mono text-[12px]'>
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

/** each section and the words its fallback uses; header and toolbar are one row high */
const sections = {
  header: { isRow: true, what: 'the header' },
  panel: { isRow: false, what: 'the side panel' },
  pieces: { isRow: false, what: 'the pieces list' },
  takes: { isRow: false, what: 'the takes list' },
  toolbar: { isRow: true, what: 'the bench tools' },
  viewport: { isRow: false, what: 'the piece' },
} as const satisfies Record<string, { isRow: boolean; what: string }>;

/* Types */

type SectionName = keyof typeof sections;

interface SectionProps {
  children: ReactNode;
  name: SectionName;
}

interface SectionFallbackProps extends FallbackProps {
  isRow: boolean;
  what: string;
}
