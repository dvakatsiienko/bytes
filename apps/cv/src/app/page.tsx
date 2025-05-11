'use client';
/* Core */
import Image from 'next/image';
import { cx } from 'cva';

/* Components */
import { Entry } from '@/components/Entry';
import { JobEntry } from '@/components/JobEntry';
import { ExternalLink } from '@/elements';
import { SectionHeading } from '@/components/SectionHeading';
import { ToolSection } from './parts/ToolSection';

/* Instruments */
import { LINK_ID_CV_TOOLS } from '@/ids';
import { __DEV__, EMAIL_TO } from '@/falgs';
import {
    toolListCore,
    toolListState,
    toolListStyles,
    toolListLLM,
    toolListAuth,
    toolListNetwork,
    toolListDb,
    toolListAnimations,
    toolListBundlers,
    toolListComponents,
    toolListAi,
} from './parts/toolConfig';
import meJpeg from '/public/my-photo.jpeg';
import logoJpeg from '/public/logo.jpeg';

// import { Masonry } from 'masonic';
// import { EasyMasonryComponent } from './EasyMasonryComponent';

export default function CVPage() {
    const briefSectionCn = cx('grid grid-cols-[minmax(auto,max-content)_auto] gap-x-4');

    return (
        <main className={cx('prose-custom prose-style mx-auto')}>
            {/* <EasyMasonryComponent /> */}
            <SectionHeading className='mt-4' accentColor='sky' text='brief' />

            <article className='grid grid-cols-[1fr_auto] place-items-start'>
                <section className={briefSectionCn}>
                    <Entry content='dima vakatsiienko' name='name' />
                    <Entry
                        className='break-all'
                        name='email'
                        content={<a href={EMAIL_TO}>{process.env.NEXT_PUBLIC_ADDRESS_EMAIL}</a>}
                    />
                    <Entry content='ukraine, kyiv' name='location' />
                    <Entry
                        name='links'
                        content={
                            <>
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_GITHUB}>github</ExternalLink>,{' '}
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_LINKEDIN}>linkedin</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_TELEGRAM}>telegram</ExternalLink>
                            </>
                        }
                    />
                    <Entry content='frontend engineer, frontend lead, hybrid' name='role' />
                </section>

                <picture className='aspect-2/3 relative m-0 hidden w-23 sm:block'>
                    <Image
                        fill
                        sizes='10vw'
                        priority
                        alt='Picture of the author'
                        className='select-none rounded-2xl object-cover'
                        placeholder='blur'
                        src={meJpeg}
                    />
                </picture>
            </article>

            <article className='grid grid-flow-dense grid-cols-4 gap-1 sm:grid-cols-9'>
                <SectionHeading
                    id={LINK_ID_CV_TOOLS}
                    className='col-span-full'
                    accentColor='purple'
                    text='tools I use'
                />

                {/* <ToolSection className='col-span-3' title='frameworks' toolList={toolListFrameworks} /> */}
                <ToolSection color='orange' className='col-span-2 sm:col-span-5' title='core' toolList={toolListCore} />
                <ToolSection
                    color='indigo'
                    className='col-span-2 sm:col-span-2'
                    title='style'
                    toolList={toolListStyles}
                />
                <ToolSection color='sky' className='col-span-2 sm:col-span-2' title='state' toolList={toolListState} />

                <ToolSection
                    color='fuchsia'
                    className='col-span-2 sm:col-span-3'
                    title='network'
                    toolList={toolListNetwork}
                />
                <ToolSection
                    color='blue'
                    className='col-span-2 sm:col-span-4'
                    title='components'
                    toolList={toolListComponents}
                />
                <ToolSection
                    color='rose'
                    className='col-span-2 sm:col-span-2'
                    title='UX · motion'
                    toolList={toolListAnimations}
                />

                <ToolSection color='cyan' className='col-span-2 sm:col-span-2' title='auth' toolList={toolListAuth} />
                <ToolSection color='purple' className='col-span-2 sm:col-span-4' title='db' toolList={toolListDb} />
                <ToolSection color='lime' className='col-span-2 sm:col-span-3' title='AI' toolList={toolListAi} />

                <ToolSection
                    color='violet'
                    className='col-span-2 sm:col-span-4'
                    title='bundlers'
                    toolList={toolListBundlers}
                />
                <ToolSection color='emerald' className='col-span-2 sm:col-span-5' title='LLM' toolList={toolListLLM} />
            </article>

            {__DEV__ && (
                <article className='grid grid-cols-2 place-items-start gap-4'>
                    <SectionHeading className='col-span-full' accentColor='cyan' text='projects' />

                    <JobEntry
                        comapnyLogoUrl={logoJpeg}
                        position='Senior Frontend Engineer'
                        project={
                            <>
                                Geoscience{' '}
                                <ExternalLink href='https://drive.google.com/file/d/1KXjt-9Kja2aRQj3-3hOFUJmHrHzHdEfG/view'>
                                    ex 1
                                </ExternalLink>
                                ,{' '}
                                <ExternalLink href='https://drive.google.com/file/d/1OV1GAm6M3h_DDKFj6cjPq4LOkd261y9V/view'>
                                    ex 2
                                </ExternalLink>
                                ,{' '}
                                <ExternalLink href='https://drive.google.com/file/d/1-DR5b_rJmcpS4Ca2ioM5ZrRn_KhRVjdy/view'>
                                    ex 3
                                </ExternalLink>
                            </>
                        }
                        achievementList={[
                            "Prototyped product's new frontend architecture, mentored team",
                            'Coordinated the migration from the old tech stack to the new one',
                            'Implemented the new web-platform MVP using Gatsby.js, Next.js and Strapi CMS',
                            'Optimized frontend codebase using monorepo',
                        ]}
                        employer={<ExternalLink href='https://www.corva.ai/'>Corva.ai</ExternalLink>}
                    />
                    <JobEntry
                        comapnyLogoUrl={logoJpeg}
                        position='Senior Frontend Engineer'
                        project='Essay'
                        achievementList={[
                            'Re-architected problematic project fundament',
                            'Project rewrite from JavaScript to TypeScript',
                            'Introduced best practices of code organization, UI layout principles, performance metrics Conducted platform audit and invested hi-end technical solutions',
                            'Integrated cutting-edge rust-based tooling to the development toolchain',
                        ]}
                        employer={<ExternalLink href='https://boosta.biz/'>Boosta</ExternalLink>}
                    />
                </article>
            )}
        </main>
    );
}
