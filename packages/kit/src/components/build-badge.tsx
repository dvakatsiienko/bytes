'use client';

import { useEffect, useState } from 'react';
import { cn } from 'cn';
import { ArrowLeftRightIcon } from 'lucide-react';

import type { Build, Other } from '../lib/build';
import { BUILD_PATH, OTHERS_PATH } from '../lib/build';
import { buttonVariants } from './button';

/**
 * Which checkout this dev server runs from — «main», or a coder's branch in a
 * worktree — and a ⇆ jump to the other side when it answers: a worktree offers
 * main, main offers each live worktree. The jump keeps the path, so the same
 * view opens there. Dev only: a production bundle renders nothing and asks
 * nothing. The app serves the two endpoints with `buildBadgeVite` or
 * `getBuild` / `getBuildOthers` from `lib/build-server`.
 */
export const BuildBadge = (props: BuildBadgeProps) => {
  const build = useBuild();
  const others = useOthers(build !== null);
  // a failed git read, or no endpoint at all, leaves no build: nothing shows
  if (!build) return null;

  const switchListJSX = others
    .filter((other) => other.isDev !== build.isDev)
    .map((other) => {
      const href = `${location.protocol}//${location.hostname}:${other.port}${location.pathname}${location.search}`;
      return (
        <a
          className={cn(
            buttonVariants({ size: 'sm', variant: 'ghost' }),
            'max-w-48 font-mono text-[12px] text-muted-foreground',
          )}
          href={href}
          key={other.port}
          title={`open this view on ${other.name} (:${other.port})`}>
          <ArrowLeftRightIcon />
          <span className='truncate'>{other.name}</span>
        </a>
      );
    });

  // a long branch truncates; a phone-wide screen has no room for it
  return (
    <div
      className={cn(
        'hidden min-w-0 items-center gap-1 sm:flex',
        props.placement === 'inline' ? '' : cornerClass,
      )}
      data-slot='build-badge'>
      <span
        className='flex min-w-0 max-w-72 font-mono text-[12px] text-muted-foreground'
        title={`running from ${build.branch}`}>
        <span className='truncate'>{build.branch}</span>
      </span>
      {switchListJSX}
    </div>
  );
};

/* Styles */

// bottom centre: next's dev indicator holds the bottom-left corner and the query devtools the bottom-right
const cornerClass =
  'fixed bottom-2 left-1/2 z-50 -translate-x-1/2 rounded-md border bg-popover/90 py-0.5 pr-0.5 pl-2.5 shadow-md backdrop-blur-sm';

/* Helpers */

const isProduction = process.env.NODE_ENV === 'production';

/** the json at `path`, or null for anything else — no server, an aborted ask, a failed answer, or an html page a spa fallback served in its place */
const readJson = async <T,>(path: string, signal: AbortSignal) => {
  try {
    const answer = await fetch(path, { signal });
    if (!(answer.ok && answer.headers.get('content-type')?.includes('json')))
      return null;
    return (await answer.json()) as T;
  } catch {
    return null;
  }
};

/** this server's checkout; asked again when the tab comes back, so a pull shows without a reload */
const useBuild = () => {
  const [build, setBuild] = useState<Build | null>(null);
  useEffect(() => {
    if (isProduction) return;
    const controller = new AbortController();
    const ask = () => {
      readJson<Build>(BUILD_PATH, controller.signal).then(setBuild);
    };
    ask();
    window.addEventListener('focus', ask);
    return () => {
      window.removeEventListener('focus', ask);
      controller.abort();
    };
  }, []);
  return build;
};

/** the same app on the other worktrees, asked every 10 s; a server that stops drops out on the next ask */
const useOthers = (isEnabled: boolean) => {
  const [others, setOthers] = useState<Other[]>([]);
  useEffect(() => {
    if (isProduction || !isEnabled) return;
    const controller = new AbortController();
    const ask = () => {
      readJson<Other[]>(OTHERS_PATH, controller.signal).then((answer) =>
        setOthers(answer ?? []),
      );
    };
    ask();
    const timer = setInterval(ask, 10_000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [isEnabled]);
  return others;
};

/* Types */

interface BuildBadgeProps {
  /** `inline` sits in the app's own layout (atelier's view corner); the default floats bottom centre over any app */
  placement?: 'corner' | 'inline';
}
