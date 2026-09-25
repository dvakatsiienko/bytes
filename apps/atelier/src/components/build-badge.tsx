import { useQuery } from '@tanstack/react-query';

import type { Build } from '../../server/build.ts';

/**
 * Which checkout this studio runs from: «main · 2a407e1f» on the daemon,
 * a coder's branch in a worktree. Asked again when the tab comes back, so a
 * pull shows without a reload.
 */
export const BuildBadge = () => {
  const build = useQuery({
    queryFn: async (): Promise<Build> => (await fetch('/api/build')).json(),
    queryKey: ['build'],
  }).data;
  if (!build) return null;
  // a long branch gives way first and the sha always shows; a phone-wide header has no room for either
  return (
    <span
      className='hidden min-w-0 max-w-72 font-mono text-[12px] text-muted-foreground sm:flex'
      title={`running from ${build.branch} · ${build.sha}`}>
      <span className='truncate'>{build.branch}</span>
      <span className='shrink-0 whitespace-pre'> · {build.sha}</span>
    </span>
  );
};
