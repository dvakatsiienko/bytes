import { cn } from '@ui/kit/lib/utils';

import { BriefEntry } from './BriefEntry';

export const Project = (props: IProjectProps) => {
  return (
    <section
      className={cn(
        'gap-x-2',
        'grid grid-cols-[auto_1fr] rounded-md px-4 py-2',
        'bg-surface-5 dark:bg-surface-1',
        'shadow-md',
        'text-pretty',
      )}>
      <BriefEntry content={props.employer} name='employer' />
      <BriefEntry content={props.dates} name='dates' />
      <BriefEntry content={props.projectRole} name='role' />
      <div className='col-span-full mt-1'>{props.description}</div>
    </section>
  );
};

/* Types */
interface IProjectProps {
  dates: string;
  description: React.ReactNode;
  employer: React.ReactNode;
  projectRole: string;
}
