/* Core */
import Image from 'next/image';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

/* Components */
import { Entry } from '@/components/Entry';
import { JobEntry } from '@/components/JobEntry';
import { ExternalLink } from '@/elements';

/* Instruments */
import meJpeg from '/public/my-photo.jpeg';
import logoJpeg from '/public/logo.jpeg';

import { FEATURE_CV_READY } from '@/falgs';

export default function CVPage() {
    if (!FEATURE_CV_READY) {
        redirect('/cover');
    }

    return (
        <>
            <section className=''>
                <h1>👨🏼‍✈️ Profile</h1>

                <section className='gap-4'>
                    <picture className='aspect-2/3 relative float-right w-24 md:w-52'>
                        <Image
                            fill
                            sizes='10vw'
                            priority
                            alt='Picture of the author'
                            className='h-full w-full rounded-md object-cover'
                            placeholder='blur'
                            src={meJpeg}
                        />
                    </picture>
                    {/* {'text '.repeat(300)} */}
                </section>

                <Entry content='Dima Vakatsiienko' name='name' />
                <Entry
                    name='email'
                    content={<a href='mailto:imagnum.satellite@gmail.com '>imagnum.satellite@gmail.com</a>}
                />
                <Entry content='Ukraine, Kyiv' name='location' />
                <Entry
                    name='links'
                    content={
                        <>
                            <ExternalLink href='https://telegra.ph/SeniorLead-Frontend-Developer-10-02'>
                                Cover Letter
                            </ExternalLink>
                            ,&nbsp;
                            <ExternalLink href='https://github.com/dvakatsiienko'>Github</ExternalLink>
                            ,&nbsp;
                            <ExternalLink href='https://www.linkedin.com/in/dima-vakatsiienko-a20271100/'>
                                Linkedin
                            </ExternalLink>
                            ,&nbsp;
                            <ExternalLink href='https://t.me/shining1488'>Telegram</ExternalLink>
                        </>
                    }
                />
                <Entry content={<b>Frontend Developer, Frontend Team/Tech Lead, Hybrid</b>} name='desired position' />
                <Entry
                    content="Hello! I have a deep expertise of modern web development. As a tutor I\'ve taught over 500+ students with cutting edge JavaScript, React, Next.js, Redux, Redux Saga, webpack, Immutable.js and Flowtype. My goal is to join a great team of enthusiasts who want to write perfect code and develop top notch web applications of the future."
                    name='objective'
                />
            </section>

            <section className='section'>
                <h1>🔮 Skills</h1>

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
            </section>

            <section className='section'>
                <h1>🖥️ Portfolio</h1>

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
            </section>
        </>
    );
}

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko CV',
    description: 'Dima Vakatsiienko CV, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
