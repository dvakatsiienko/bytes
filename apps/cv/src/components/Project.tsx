import { cn } from '@ui/kit/lib/utils';
import { type StaticImageData } from 'next/image';

import { BriefEntry } from './BriefEntry';

export const Project = (props: PrjectProps) => {
  const achievementListJSX = props.achievementList.map((achievement, index) => {
    // biome-ignore lint/suspicious/noArrayIndexKey: no id for this
    return <li key={index}>{achievement}</li>;
  });

  return (
    <section
      className={cn(
        'gap-x-2',
        'prose-li:m-0 grid grid-cols-[auto_1fr] rounded-md px-4 py-2',
        'bg-surface-5 dark:bg-surface-1',
        'shadow-md',

        // TODO reconsier text-pretty/balance
        'text-pretty',
      )}>
      <BriefEntry content={props.employer} name='employer' />
      <BriefEntry content={props.projectRole} name='role' />
      {props.courses && <BriefEntry content={props.courses} name='courses' />}
      {props.projectName && (
        <BriefEntry content={props.projectName} name='project' />
      )}
      <BriefEntry
        className='col-span-full'
        content={<ul>{achievementListJSX}</ul>}
        name='achievements'
      />

      {/* <Image priority alt='Company logo' placeholder='blur' src={props.comapnyLogoUrl} width={100} /> */}
    </section>
  );
};

/* Types */
interface PrjectProps {
  employer: React.ReactNode;
  projectRole: string;
  projectName?: React.ReactNode;
  courses?: React.ReactNode;
  achievementList: React.ReactNode[];
  comapnyLogoUrl: StaticImageData;
}
