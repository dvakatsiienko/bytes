/* Core */
import Image from 'next/image';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { cx } from 'cva';
import type { Metadata } from 'next';
/* Components */
import { Entry } from '@/components/Entry';
import { JobEntry } from '@/components/JobEntry';
import { ExternalLink } from '@/elements';
import { SectionHeading } from '@/components/SectionHeading';

/* Instruments */
import meJpeg from '/public/my-photo.jpeg';
import logoJpeg from '/public/logo.jpeg';

import { FEATURE_CV_READY, EMAIL_TO } from '@/falgs';

export default function CVPage() {
    if (!FEATURE_CV_READY) {
        redirect('/cover');
    }

    const articleCn = cx('grid grid-cols-[minmax(auto,max-content)_auto] gap-x-4');

    return (
        <main className={cx('mx-auto', 'prose-custom prose-style')}>
            <SectionHeading color='sky' text='Brief' />

            <article className='grid grid-cols-[1fr_auto]'>
                <section className={articleCn}>
                    <Entry content='Dima Vakatsiienko' name='name' />
                    <Entry name='email' content={<a href={EMAIL_TO}>{process.env.NEXT_PUBLIC_ADDRESS_EMAIL}</a>} />
                    <Entry content='Ukraine, Kyiv' name='location' />
                    <Entry
                        name='links'
                        content={
                            <>
                                <NextLink href='/cover'>Cover</NextLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_GITHUB}>Github</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_LINKEDIN}>Linkedin</ExternalLink>
                                ,&nbsp;
                                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_TELEGRAM}>Telegram</ExternalLink>
                            </>
                        }
                    />
                    <Entry content={<b>Frontend Engineer, Frontend Lead, Hybrid</b>} name='role' />
                </section>

                <picture className='aspect-2/3 m-0! relative hidden w-20 sm:block'>
                    <Image
                        fill
                        sizes='10vw'
                        priority
                        alt='Picture of the author'
                        className='rounded-md object-cover'
                        placeholder='blur'
                        src={meJpeg}
                    />
                </picture>
            </article>

            <article>
                <SectionHeading color='purple' text='Stuff that I use' />

                <Entry
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
                />
                <Entry
                    name='peripheral'
                    content={
                        <ul>
                            <li>★ ★ ★ ★ ★ — styled-components, , sass, PostCSS, yarn, npm, pnpm</li>
                            <li>★ ★ ★ ★ ☆ — HTML, CSS, Figma, Adobe XD, Zepplin</li>
                            <li>★ ★ ★ ☆ ☆ — mobile first, responsive fluid design</li>
                        </ul>
                    }
                />
                <Entry
                    name='Other'
                    content={
                        <ul>
                            <li>Rich tutoring and mentoring experience</li>
                            <li>Rich online/offline live performance experience — webinars, workshops, courses</li>
                            <li>Good understanding of QA processes</li>
                            <li>Development workflow management experience</li>
                        </ul>
                    }
                />
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

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko CV',
    description: 'Dima Vakatsiienko CV, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
