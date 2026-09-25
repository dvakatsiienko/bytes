import { buttonVariants } from '@ui/kit/components/button';
import { cn } from 'cn';
import { ArrowLeftRightIcon } from 'lucide-react';

import { useBuild, useOthers } from '../build.ts';

/**
 * Which checkout this studio runs from — «main · 2a407e1f» on the daemon, a
 * coder's branch in a worktree — and a jump to the other side when it answers:
 * a worktree offers main, main offers each live worktree. The jump keeps the
 * path, so the same piece or take opens there.
 */
export const BuildBadge = () => {
  const build = useBuild();
  const others = useOthers();
  // a failed git read leaves no build, so nothing shows rather than «undefined»
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
          title={`open this view on ${other.name} · ${other.sha} (:${other.port})`}>
          <ArrowLeftRightIcon />
          <span className='truncate'>{other.name}</span>
        </a>
      );
    });

  // a long branch gives way first and the sha always shows; a phone-wide header has no room for either
  return (
    <div className='hidden min-w-0 items-center gap-1 sm:flex'>
      <span
        className='flex min-w-0 max-w-72 font-mono text-[12px] text-muted-foreground'
        title={`running from ${build.branch} · ${build.sha}`}>
        <span className='truncate'>{build.branch}</span>
        <span className='shrink-0 whitespace-pre'> · {build.sha}</span>
      </span>
      {switchListJSX}
    </div>
  );
};
