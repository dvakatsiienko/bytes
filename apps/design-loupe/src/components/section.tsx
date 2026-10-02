import type { ReactNode } from 'react';
import { Button } from '@ui/kit/components/button';
import { RotateCcwIcon, SearchXIcon } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { devCrash, isDev } from '@/dev-crash.ts';
import { usePath } from '@/route.ts';

/** one region that fails alone: its fallback keeps the region's box, the other region keeps working */
export const Section = (props: SectionProps) => {
  return (
    <ErrorBoundary
      fallbackRender={(fallback) => {
        return <SectionFallback {...fallback} what={sections[props.name]} />;
      }}
      // a new ask or board in the path clears the error by itself
      resetKeys={[usePath()]}>
      <DevCrash section={props.name} />
      {props.children}
    </ErrorBoundary>
  );
};

/** the last net, when a render fails outside both sections */
export const RootFallback = (props: FallbackProps) => {
  return (
    <main className='grid h-dvh place-items-center bg-desk p-6'>
      <div
        className='flex max-w-lg flex-col gap-3 rounded-xl border bg-card p-6'
        role='alert'>
        <h1 className='font-semibold text-xl'>loupe stopped drawing</h1>
        <p className='select-all font-mono text-muted-foreground text-xs'>
          {errorText(props.error)}
        </p>
        <Button
          className='self-start'
          onClick={() => location.reload()}
          size='sm'
          variant='outline'>
          reload loupe
        </Button>
      </div>
    </main>
  );
};

export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const SectionFallback = (props: SectionFallbackProps) => {
  return (
    <div
      className='flex h-full min-h-40 w-full flex-col items-center justify-center gap-3 overflow-auto bg-desk p-6 text-center'
      role='alert'>
      <span className='grid size-10 place-items-center rounded-full bg-muted text-muted-foreground'>
        <SearchXIcon aria-hidden className='size-5' />
      </span>
      <div className='flex flex-col gap-1'>
        <p className='font-semibold text-base'>{props.what} stopped drawing</p>
        <p className='text-muted-foreground text-sm'>
          the rest of loupe still works
        </p>
      </div>
      <Button onClick={props.resetErrorBoundary} size='sm' variant='outline'>
        <RotateCcwIcon /> try again
      </Button>
      {isDev ? (
        <details className='w-full max-w-md text-left text-muted-foreground'>
          <summary className='cursor-pointer text-center text-sm'>
            what broke
          </summary>
          <pre className='mt-2 max-h-40 select-all overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 font-mono text-foreground text-xs'>
            {errorText(props.error)}
          </pre>
        </details>
      ) : null}
    </div>
  );
};

const DevCrash = (props: { section: SectionName }) => {
  devCrash(props.section);
  return null;
};

/* Helpers */

const sections = {
  panel: 'the ask panel',
  surface: 'the boards',
} as const;

/* Types */

type SectionName = keyof typeof sections;

interface SectionProps {
  children: ReactNode;
  name: SectionName;
}

interface SectionFallbackProps extends FallbackProps {
  what: string;
}
