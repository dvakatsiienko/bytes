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
import * as links from '@/links';
import { __DEV__, EMAIL_TO } from '@/frags';
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
        <main
            className={cx(
                'prose-custom prose-style mx-auto',
                // todo do something with txt size and line height
                'max-w-8xl text-sm/snug',
            )}>
            {/* <EasyMasonryComponent /> */}
            <SectionHeading className='mt-4' accentColor='sky' text='brief' />

            <article className='grid grid-cols-[1fr_auto] place-items-start'>
                <section className={briefSectionCn}>
                    <BriefEntry content='dima vakatsiienko' name='name' />
                    <BriefEntry
                        className='break-all'
                        name='email'
                        content={<a href={EMAIL_TO}>{links.ADDRESS_EMAIL_PERSONAL}</a>}
                    />
                    <BriefEntry content='ukraine, kyiv' name='location' />
                    <BriefEntry
                        name='links'
                        content={
                            <>
                                <ExternalLink href={links.ADDRESS_GITHUB_PERSONAL}>github</ExternalLink>,{' '}
                                <ExternalLink href={links.ADDRESS_LINKEDIN_PERSONAL}>linkedin</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={links.ADDRESS_TELEGRAM_PERSONAL}>telegram</ExternalLink>
                            </>
                        }
                    />
                    <BriefEntry content='frontend engineer, frontend lead, hybrid' name='role' />
                    <BriefEntry content='english, ukrainian, russian' name='fluent' />
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
                    id={links.LINK_ID_CV_TOOLS}
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
                <>
                    {/* TODO extract and reuse article grid cn */}
                    <article className='grid grid-cols-2 place-items-start gap-x-2 gap-y-2'>
                        <SectionHeading className='col-span-full' accentColor='emerald' text='projects' />

                        {/* turbo stars */}
                        {/* Jan 2025 - Present */}
                        <Project
                            employer={<ExternalLink href={links.LINK_TURBO_STARS}>Turbo Stars</ExternalLink>}
                            role='Lead Frontend Engineer'
                            project={<ExternalLink href={links.LINK_TURBO_STARS_SPORTSBOOK}>Sportsbook</ExternalLink>}
                            achievementList={[
                                'Upgraded the legacy Frontend build pipeline to a modern standards',
                                'Integrated Rust Frontend toolchain',
                                'Incorporated a project upscale plan',
                                <>
                                    Streamlined code review company-wide by utilizing{' '}
                                    <ExternalLink href='http://coderabbit.ai/'>CodeRabbitAI</ExternalLink>
                                </>,
                                'Coordinated and mentored Frontend team',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Anadea */}
                        {/* Jun 2022 - Oct 2023 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_ANADAEA}>Anadea</ExternalLink>}
                            role='Lead Frontend Engineer'
                            project={
                                <>
                                    <ExternalLink href={links.LINK_ANADAEA_ROCKY}>Rocky</ExternalLink>, Keystone (NDA)
                                </>
                            }
                            achievementList={[
                                // 'Rocky',
                                'Developed a social media platform from scratch',
                                'Coordinated Frontend team dev flow',
                                'Mentored Frontend team',
                                'Refined product features with client',

                                // 'Keystone',
                                'Migrated a drilling platform from PHP to Next.js',
                                'Created a component library using Vite and Storybook',
                                'Implemented a cross-team Frontend training program',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Corva */}
                        {/* 2020 - 2021 */}
                        {/* Sep 2020 - Feb 2021 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_CORVA}>Corva.ai</ExternalLink>}
                            role='Senior Frontend Engineer'
                            project={
                                <ExternalLink href={links.LINK_CORVA_GEODRILLING}>Geoscience Drilling</ExternalLink>
                            }
                            achievementList={[
                                'Re-architected project Frontend',
                                'Migrated codebase to TypeScript',
                                'Improved performance stats by 40%',
                                'Integrated rust-based tooling',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Boosta */}
                        {/* Feb 2021 - May 2021 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_BOOSTA}>Boosta</ExternalLink>}
                            role='Senior Frontend Engineer'
                            project='Essay'
                            achievementList={[
                                'Prototyped Frontend v2 architecture',
                                'Implemented Frontend using Gatsby.js and Strapi CMS',
                                'Coordinated legacy PHP backend migration',
                                'Colocated frontend codebase into a monorepo',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Temy */}
                        {/* Dec 2019 − Nov 2020 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_TEMY}>Temy</ExternalLink>}
                            role='Senior Frontend Engineer'
                            project={<ExternalLink href={links.LINK_TEMY_CCT}>CCT Marketplace</ExternalLink>}
                            achievementList={[
                                'Prototyped and developed Frontend v2 architecture rebranding',
                                'Improved a product business model by polishing features with CTO',
                                'Guided and mentored team’s development process',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Buki */}
                        {/* Nov 2019 − Apr 2020, part time */}
                        <Project
                            employer={<ExternalLink href={links.LINK_BUKI}>Buki</ExternalLink>}
                            role='Frontend Team Lead, Tutor'
                            project={<ExternalLink href={links.LINK_BUKI_MARKETPLACE}>Tutor marketplace</ExternalLink>}
                            achievementList={[
                                'Coordinated Frontend team dev flow',
                                'Tutored and mentored team',
                                //
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Lectrum */}
                        {/* Nov 2016 − Aug 2019 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_LECTRUM}>Lectrum.io</ExternalLink>}
                            role='Frontend Engineer, Tutor'
                            courses={
                                <>
                                    <ExternalLink href={links.LINK_LECTRUM_COURSE_NEXT_JS}>Next.js</ExternalLink>,
                                    React, JavaScript
                                </>
                            }
                            project='LMS platform'
                            achievementList={[
                                'Developed LMS platform',
                                'Managed team development process',
                                'Created and maintained a Frontend branch educational program',
                                'Tutored and mentored students',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* WebPal */}
                        {/* Dec 2016 − May 2017 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_WEB_PAL}>WebPal</ExternalLink>}
                            role='Junior Frontend Engineer'
                            project='NDA'
                            achievementList={['Developed internal company product with React, Redux and Electron']}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Ubisoft Lead */}
                        {/* Jul 2016 − Dec 2016 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_UBISOFT}>Ubisoft</ExternalLink>}
                            role='Associate Lead QC'
                            project={<ExternalLink href={links.LINK_UBISOFT_CONNECT}>Ubisoft Connect</ExternalLink>}
                            achievementList={[
                                'Coordinated QC team workflow',
                                'Organised milestone validation',
                                'Created guidelines and test cases',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* Ubisoft Dev Tester */}
                        {/* Nov 2015 − Jul 2016 */}
                        <Project
                            employer={<ExternalLink href={links.LINK_UBISOFT}>Ubisoft</ExternalLink>}
                            role='Junior Dev Tester'
                            project={<ExternalLink href={links.LINK_WATCH_DOGS_2}>Watch Dogs 2</ExternalLink>}
                            achievementList={[
                                'Conducted a video game console-to-PC port QA verification',
                                'Created weekly QA report graphs',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />
                    </article>

                    <article className='grid grid-cols-2 place-items-start gap-x-2 gap-y-1'>
                        <SectionHeading className='col-span-full' accentColor='orange' text='tutoring' />

                        {/* Lectrum */}
                        {/* Nov 2020 − May 2021, part time */}
                        <Project
                            employer={<ExternalLink href={links.LINK_LECTRUM}>Lectrum.io</ExternalLink>}
                            role='Course developer, Tutor'
                            courses={
                                <>
                                    <ExternalLink href={links.LINK_LECTRUM_COURSE_NEXT_JS}>Next.js</ExternalLink>, React
                                </>
                            }
                            achievementList={[
                                'Created Next.js and React course',
                                'Tutored students with React, Next.js and JavaScript',
                            ]}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* DAN.IT */}
                        {/* Oct 2019 − Jan 2020, part time */}
                        <Project
                            employer={<ExternalLink href={links.LINK_DAN_IT}>DAN.IT</ExternalLink>}
                            role='Tutor'
                            courses={
                                <>
                                    <ExternalLink href={links.LINK_DAN_IT_FRONTEND_COURSE}>Frontend</ExternalLink>,
                                    React
                                </>
                            }
                            achievementList={['Developed courses program', 'Tutored and mentored students']}
                            comapnyLogoUrl={logoJpeg}
                        />

                        {/* QA Startup */}
                        {/* Dec 2019, part time */}
                        <Project
                            employer={<ExternalLink href={links.LINK_QA_STARTUP}>QA Startup</ExternalLink>}
                            role='Tutor'
                            courses='Web Services'
                            achievementList={['Tutored and mentored students']}
                            comapnyLogoUrl={logoJpeg}
                        />
                    </article>
                </>
            )}
        </main>
    );
}
