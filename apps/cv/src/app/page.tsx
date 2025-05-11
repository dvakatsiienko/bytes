'use client';
/* Core */
import Image from 'next/image';
import { cx } from 'cva';

/* Components */
import { BriefEntry } from '@/components/BriefEntry';
import { Project } from '@/components/Project';
import { ExternalLink } from '@/elements';
import { SectionHeading } from '@/components/SectionHeading';
import { ToolSection } from './parts/ToolSection';

/* Instruments */
import {
    LINK_UBISOFT,
    LINK_UBISOFT_CONNECT,
    LINK_WATCH_DOGS_2,
    LINK_WEB_PAL,
    LINK_BOOSTA,
    LINK_ID_CV_TOOLS,
    ADDRESS_EMAIL_PERSONAL,
    ADDRESS_GITHUB_PERSONAL,
    ADDRESS_LINKEDIN_PERSONAL,
    ADDRESS_TELEGRAM_PERSONAL,
} from '@/const';
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
                    <BriefEntry content='dima vakatsiienko' name='name' />
                    <BriefEntry
                        className='break-all'
                        name='email'
                        content={<a href={EMAIL_TO}>{ADDRESS_EMAIL_PERSONAL}</a>}
                    />
                    <BriefEntry content='ukraine, kyiv' name='location' />
                    <BriefEntry
                        name='links'
                        content={
                            <>
                                <ExternalLink href={ADDRESS_GITHUB_PERSONAL}>github</ExternalLink>,{' '}
                                <ExternalLink href={ADDRESS_LINKEDIN_PERSONAL}>linkedin</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={ADDRESS_TELEGRAM_PERSONAL}>telegram</ExternalLink>
                            </>
                        }
                    />
                    <BriefEntry content='frontend engineer, frontend lead, hybrid' name='role' />
                </section>

                <picture className='aspect-2/3 w-23 relative m-0 hidden sm:block'>
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
                <article className='grid grid-cols-2 place-items-start gap-x-2 gap-y-1'>
                    <SectionHeading className='col-span-full' accentColor='emerald' text='projects' />

                    {/* Corva */}
                    <Project
                        employer={<ExternalLink href='https://www.corva.ai/'>Corva.ai</ExternalLink>}
                        role='Senior Frontend Engineer'
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
                            'Re-architected problematic project fundament',
                            'Project rewrite from JavaScript to TypeScript',
                            'Introduced best practices of code organization, UI layout principles, performance metrics Conducted platform audit and invested hi-end technical solutions',
                            'Integrated cutting-edge rust-based tooling to the development toolchain',
                        ]}
                        comapnyLogoUrl={logoJpeg}
                    />

                    {/* Boosta */}
                    <Project
                        employer={<ExternalLink href={LINK_BOOSTA}>Boosta</ExternalLink>}
                        role='Senior Frontend Engineer'
                        project='Essay'
                        achievementList={[
                            "Prototyped product's new frontend architecture, mentored team",
                            'Coordinated the migration from the old tech stack to the new one',
                            'Implemented the new web-platform MVP using Gatsby.js, Next.js and Strapi CMS',
                            'Optimized frontend codebase using monorepo',
                        ]}
                        comapnyLogoUrl={logoJpeg}
                    />

                    {/* WebPal */}
                    <Project
                        employer={<ExternalLink href={LINK_WEB_PAL}>WebPal</ExternalLink>}
                        role='Junior Frontend Engineer'
                        project='NDA'
                        achievementList={['Developed internal company product with React, Redux and Electron']}
                        comapnyLogoUrl={logoJpeg}
                    />

                    {/* Ubisoft Lead */}
                    <Project
                        employer={<ExternalLink href={LINK_UBISOFT}>Ubisoft</ExternalLink>}
                        role='Associate Lead QC'
                        project={<ExternalLink href={LINK_UBISOFT_CONNECT}>Ubisoft Connect</ExternalLink>}
                        achievementList={[
                            'Coordinated QC team workflow',
                            'Organised milestone validation',
                            'Created guidelines and test cases',
                        ]}
                        comapnyLogoUrl={logoJpeg}
                    />

                    {/* Ubisoft Dev Tester */}
                    <Project
                        employer={<ExternalLink href={LINK_UBISOFT}>Ubisoft</ExternalLink>}
                        role='Junior Dev Tester'
                        project={<ExternalLink href={LINK_WATCH_DOGS_2}>Watch Dogs 2</ExternalLink>}
                        achievementList={[
                            'Conducted a video game console-to-PC port QA verification',
                            'Created weekly QA report graphs',
                        ]}
                        comapnyLogoUrl={logoJpeg}
                    />
                </article>
            )}
        </main>
    );
}
