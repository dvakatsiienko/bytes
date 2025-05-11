/* Core */
import Image, { type StaticImageData } from 'next/image';

/* Components */
import { Entry } from './Entry';

/* Instruments */
import { cn } from '@ui/kit/lib/utils';

export const JobEntry = (props: JobEntryProps) => {
    const achievementListJSX = props.achievementList.map((achievement) => {
        return <li key={achievement}>{achievement}</li>;
    });

    return (
        <section
            className={cn(
                'prose-li:m-0 grid grid-cols-[auto_1fr] rounded-md px-4 py-2',
                'bg-surface-5 dark:bg-surface-1',
                'shadow-md',
                'gap-x-2',
            )}>
            <Entry content={props.employer} name='employer' />
            <Entry content={props.position} name='position' />
            <Entry content={props.project} name='project' />
            <Entry content={<ul>{achievementListJSX}</ul>} name='achievements' className='col-span-full' />

            {/* <Image priority alt='Company logo' placeholder='blur' src={props.comapnyLogoUrl} width={100} /> */}
        </section>
    );
};

/* Types */
interface JobEntryProps {
    employer: React.ReactNode;
    position: string;
    project: React.ReactNode;
    achievementList: string[];
    comapnyLogoUrl: StaticImageData;
}
