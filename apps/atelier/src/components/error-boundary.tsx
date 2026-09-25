import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Button } from '@ui/kit/components/button';

/**
 * A render that throws shows what broke and a way back, instead of an empty
 * page. The stack goes to the console, where the agent reading it looks.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('atelier: a render failed', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        className='grid h-dvh place-items-center bg-background p-6 text-foreground'
        role='alert'>
        <div className='flex max-w-lg flex-col gap-3'>
          <h1 className='font-serif text-2xl'>atelier stopped drawing</h1>
          <p className='select-all font-mono text-[12px] text-muted-foreground'>
            {this.state.error.message}
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
  }
}

/* Types */

interface ErrorBoundaryProps {
  children: ReactNode;
}
