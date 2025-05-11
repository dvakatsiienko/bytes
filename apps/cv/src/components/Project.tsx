/* Core */
import Image, { type StaticImageData } from 'next/image';

/* Components */
import { BriefEntry } from './BriefEntry';

/* Instruments */
import { cn } from '@ui/kit/lib/utils';

export const Project = (props: PrjectProps) => {
    const achievementListJSX = props.achievementList.map((achievement) => {
        return <li key={achievement}>{achievement}</li>;
    });

    return (
        <section
            className={cn(
                'gap-x-2',
                'prose-li:m-0 grid grid-cols-[auto_1fr] rounded-md px-4 py-2',
                'bg-surface-5 dark:bg-surface-1',
                'shadow-md',

                // TODO reconsier text-pretty/balance
                'text-pretty'
            )}>
            <BriefEntry content={props.employer} name='employer' />
            <BriefEntry content={props.role} name='role' />
            <BriefEntry content={props.project} name='project' />
            <BriefEntry content={<ul>{achievementListJSX}</ul>} name='achievements' className='col-span-full' />

            {/* <Image priority alt='Company logo' placeholder='blur' src={props.comapnyLogoUrl} width={100} /> */}
        </section>
    );
};

/* Types */
interface PrjectProps {
    employer: React.ReactNode;
    role: string;
    project: React.ReactNode;
    achievementList: string[];
    comapnyLogoUrl: StaticImageData;
}
