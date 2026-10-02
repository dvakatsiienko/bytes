import { useEffect } from 'react';

import { AskPanel } from '@/components/ask-panel';
import { BuildBadge } from '@/components/build-badge';
import { Section, errorText } from '@/components/section';
import { Surface } from '@/components/surface';

import { useJob } from '@/api.ts';
import { parseRoute, usePath } from '@/route.ts';
import { faviconSvg, openCountOf, tabTitle } from '@/view.ts';

/** the boards on the left, the asks on the right; the path says which ask is open */
export const Loupe = () => {
  const job = useJob();
  const target = parseRoute(usePath());
  const openCount = job.data ? openCountOf(job.data.asks) : 0;

  useEffect(() => {
    if (!job.data) return;
    document.title = tabTitle(job.data.name, openCount);
    const icon = document.querySelector<HTMLLinkElement>('link[rel=icon]');
    if (icon)
      icon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg(openCount))}`;
  }, [job.data, openCount]);

  if (job.isPending) return <main aria-busy className='h-dvh bg-desk' />;
  if (job.isError)
    return (
      <main className='grid h-dvh place-items-center bg-desk p-6'>
        <div
          className='flex max-w-lg flex-col gap-2 rounded-xl border bg-card p-6'
          role='alert'>
          <h1 className='font-semibold text-xl'>loupe cannot read the job</h1>
          <p className='select-all font-mono text-muted-foreground text-xs'>
            {errorText(job.error)}
          </p>
          <p className='text-muted-foreground text-sm'>
            fix the file it names; the page reloads by itself when it changes
          </p>
        </div>
      </main>
    );

  return (
    <main className='flex h-dvh min-h-0 overflow-hidden bg-desk'>
      <div className='relative min-w-0 flex-1'>
        <Section name='surface'>
          <Surface job={job.data} target={target} />
        </Section>
        <div className='absolute top-3 left-3 rounded-lg border bg-background/90 px-1 shadow-sm empty:hidden'>
          <BuildBadge />
        </div>
      </div>
      <aside className='flex w-[380px] shrink-0 flex-col border-l bg-background'>
        <Section name='panel'>
          <AskPanel job={job.data} openCount={openCount} target={target} />
        </Section>
      </aside>
    </main>
  );
};
