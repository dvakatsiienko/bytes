'use client';
/* Core */
import Image from 'next/image';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { cx } from 'cva';
import type { Metadata } from 'next';

/* Components */
import { Entry } from '@/components/Entry';
import { JobEntry } from '@/components/JobEntry';
import { Tool } from '@/app/parts/Tool';
import { ExternalLink } from '@/elements';
import { SectionHeading } from '@/components/SectionHeading';
import { ToolSection } from './parts/ToolSection';

/* Instruments */
import meJpeg from '/public/my-photo.jpeg';
import logoJpeg from '/public/logo.jpeg';

import { FEATURE_CV_READY, EMAIL_TO } from '@/falgs';
import {
    stuff,
    toolListCore,
    toolListState,
    toolListStyles,
    toolListAi,
    toolListFrameworks,
    toolListAuth,
    toolListNetwork,
    toolListDb,
    toolListAnimations,
    toolListBundlers,
} from './parts/toolConfig';

import * as React from 'react';
// import { EasyMasonryComponent } from './EasyMasonryComponent';

// import { Masonry } from 'masonic';

export default function CVPage() {
    if (!FEATURE_CV_READY) {
        redirect('/cover');
    }

    const articleCn = cx('grid grid-cols-[minmax(auto,max-content)_auto] gap-x-4');

    return (
        <main className={cx('prose-custom prose-style w-full max-w-7xl')}>
            {/* <EasyMasonryComponent /> */}
            <SectionHeading className='mt-4' color='sky' text='brief' />

            <article className='grid grid-cols-[1fr_auto]'>
                <section className={articleCn}>
                    <Entry content='dima vakatsiienko' name='name' />
                    <Entry name='email' content={<a href={EMAIL_TO}>{process.env.NEXT_PUBLIC_ADDRESS_EMAIL}</a>} />
                    <Entry content='ukraine, kyiv' name='location' />
                    <Entry
                        name='links'
                        content={
                            <>
                                <NextLink href='/cover'>cover</NextLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_GITHUB}>github</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_LINKEDIN}>linkedin</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_TELEGRAM}>telegram</ExternalLink>
                            </>
                        }
                    />
                    <Entry content='frontend engineer, frontend lead, hybrid' name='role' />
                </section>

                <picture className='aspect-2/3 m-0! relative hidden w-20 sm:block'>
                    <Image
                        fill
                        sizes='10vw'
                        priority
                        alt='Picture of the author'
                        className='select-none rounded-md object-cover'
                        placeholder='blur'
                        src={meJpeg}
                    />
                </picture>
            </article>

            <article className='grid grid-cols-12 gap-0.5'>
                <SectionHeading className='col-span-full' color='purple' text='stuff I use' />

                {/* <Masonry
                    items={stuff}
                    render={ToolSection}
                    //  items={items}
                    // Adds 8px of space between the grid cells
                    maxColumnCount={6}
                    columnGutter={8}
                    // Sets the minimum column width to 172px
                    columnWidth={220}
                    overscanBy={5}
                /> */}
                {/* {stuff.map(({ area, toolList }) => (
                    <ToolSection key={area} area={area} toolList={toolList} />
                ))} */}

                <ToolSection className='col-span-6' title='core' toolList={toolListCore} />
                <ToolSection className='col-span-4' title='frameworks' toolList={toolListFrameworks} />
                <ToolSection className='col-span-2' title='auth' toolList={toolListAuth} />

                <ToolSection className='col-span-3' title='state' toolList={toolListState} />
                <ToolSection className='col-span-5' title='network' toolList={toolListNetwork} />
                <ToolSection className='col-span-4 row-span-2' title='db' toolList={toolListDb} />

                <ToolSection className='col-span-8' title='style' toolList={toolListStyles} />

                <ToolSection className='col-span-2' title='animation' toolList={toolListAnimations} />
                <ToolSection className='col-span-10' title='AI · LLM' toolList={toolListAi} />
                <ToolSection className='col-span-10' title='bundlers' toolList={toolListBundlers} />

                {/* <Entry
                    name='core'
                    content={
                        <ul>
                            <li>
                                ★ ★ ★ ★ ★ — ESNext, TypeScript, React, Next.js, Redux, Apollo GraphQL, react-query,
                                webpack
                            </li>
                            <li>★ ★ ★ ★ ☆ — Gatsby.js, Jest, Enzyme, REST, backend processes, Vercel</li>
                            <li>
                                ★ ★ ★ ☆ ☆ — Node.js, Prisma, express.js, MongoDB, Mongoose.js, Headless CMS's, zshell,,
                                Docker
                            </li>
                        </ul>
                    }
                /> */}
                {/* <Entry
                    name='peripheral'
                    content={
                        <ul>
                            <li>★ ★ ★ ★ ★ — styled-components, , sass, PostCSS, yarn, npm, pnpm</li>
                            <li>★ ★ ★ ★ ☆ — HTML, CSS, Figma, Adobe XD, Zepplin</li>
                            <li>★ ★ ★ ☆ ☆ — mobile first, responsive fluid design</li>
                        </ul>
                    }
                /> */}
                {/* <Entry
                    name='Other'
                    content={
                        <ul>
                            <li>Rich tutoring and mentoring experience</li>
                            <li>Rich online/offline live performance experience — webinars, workshops, courses</li>
                            <li>Good understanding of QA processes</li>
                            <li>Development workflow management experience</li>
                        </ul>
                    }
                /> */}
            </article>

            {/* <article>
                <h2>Portfolio</h2>

                <JobEntry
                    comapnyLogoUrl={logoJpeg}
                    position='Senior Frontend Engineer'
                    project='Geoscience LINK TO EXAMPLES'
                    achievementList={[
                        "Prototyped product's new frontend architecture, mentored team",
                        'Coordinated the migration from the old tech stack to the new one',
                        'Implemented the new web-platform MVP using Gatsby.js, Next.js and Strapi CMS',
                        'Optimized frontend codebase using monorepo',
                    ]}
                    employer={<ExternalLink href='https://www.corva.ai/'>Corva.ai</ExternalLink>}
                    manager={
                        <>
                            Artem Sychov —{' '}
                            <ExternalLink href='https://www.linkedin.com/in/suchov/'>LinkedIn</ExternalLink>,{' '}
                            <ExternalLink href='https://t.me/artem_sychov'>Telegram</ExternalLink>
                        </>
                    }
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
                    employer={<ExternalLink href='https://boosta.biz/en/'>Boosta</ExternalLink>}
                    manager={
                        <>
                            Vlad Muzychenko —
                            <ExternalLink href='https://www.linkedin.com/in/vladyslav-muzychenko-796392127/'>
                                LinkedIn
                            </ExternalLink>
                            , <ExternalLink href='https://t.me/vlmuzychenko'>Telegram</ExternalLink>
                        </>
                    }
                />
            </article> */}
        </main>
    );
}
