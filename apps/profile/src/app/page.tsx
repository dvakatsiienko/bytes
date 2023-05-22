/* Core */
import Image, { type StaticImageData } from 'next/image';

/* Components */
import { ExternalLink, ThemeSwitcher } from '@/app/elements';

/* Instruments */
import styles from './index-page.module.scss';
import meJpeg from 'public/my-photo.jpeg';
import logoJpeg from 'public/logo.jpeg';

export default () => {
    return (
        <main className = { styles.profile }>
            <ThemeSwitcher />

            <section>
                <h1>👨🏼‍✈️ Profile</h1>

                <Image alt = 'Picture of the author' placeholder = 'blur' src = { meJpeg } width = { 200 } />
                <Entry content = 'Dima Vakatsiienko' name = 'name' />
                <Entry
                    name = 'email'
                    content = { (
                        <a href = 'mailto:imagnum.satellite@gmail.com '>
                            imagnum.satellite@gmail.com
                        </a>
                      ) }
                />
                <Entry content = 'Ukraine, Kyiv' name = 'location' />
                <Entry
                    name = 'links'
                    content = { (
                        <>
                            <ExternalLink href = 'https://telegra.ph/SeniorLead-Frontend-Developer-10-02'>
                                Cover Letter
                            </ExternalLink>
                            ,&nbsp;
                            <ExternalLink href = 'https://github.com/dvakatsiienko'>
                                Github
                            </ExternalLink>
                            ,&nbsp;
                            <ExternalLink href = 'https://www.linkedin.com/in/dima-vakatsiienko-a20271100/'>
                                Linkedin
                            </ExternalLink>
                            ,&nbsp;
                            <ExternalLink href = 'https://t.me/shining1488'>Telegram</ExternalLink>
                        </>
                      ) }
                />
                <Entry
                    content = { <b>Frontend Developer, Frontend Team/Tech Lead, Hybrid</b> }
                    name = 'desired position'
                />
                <Entry
                    content = "Hello! I have a deep expertise of modern web development. As a tutor I\'ve taught over 500+ students with cutting edge JavaScript, React, Next.js, Redux, Redux Saga, webpack, Immutable.js and Flowtype. My goal is to join a great team of enthusiasts who want to write perfect code and develop top notch web applications of the future."
                    name = 'objective'
                />
            </section>

            <section>
                <h1>🔮 Skills</h1>

                <Entry
                    name = 'core'
                    content = { (
                        <ul>
                            <li>
                                ★ ★ ★ ★ ★ — ESNext, TypeScript, React, Next.js, Redux, Apollo
                                GraphQL, react-query, webpack
                            </li>
                            <li>
                                ★ ★ ★ ★ ☆ — Gatsby.js, Jest, Enzyme, REST, backend processes, Vercel
                            </li>
                            <li>
                                ★ ★ ★ ☆ ☆ — Node.js, Prisma, express.js, MongoDB, Mongoose.js,
                                Headless CMS's, zshell,, Docker
                            </li>
                        </ul>
                      ) }
                />
                <Entry
                    name = 'peripheral'
                    content = { (
                        <ul>
                            <li>★ ★ ★ ★ ★ — styled-components, , sass, PostCSS, yarn, npm, pnpm</li>
                            <li>★ ★ ★ ★ ☆ — HTML, CSS, Figma, Adobe XD, Zepplin</li>
                            <li>★ ★ ★ ☆ ☆ — mobile first, responsive fluid design</li>
                        </ul>
                      ) }
                />
                <Entry
                    name = 'Other'
                    content = { (
                        <ul>
                            <li>Rich tutoring and mentoring experience</li>
                            <li>
                                Rich online/offline live performance experience — webinars,
                                workshops, courses
                            </li>
                            <li>Good understanding of QA processes</li>
                            <li>Development workflow management experience</li>
                        </ul>
                      ) }
                />
            </section>

            <section>
                <h1>🖥️ Portfolio</h1>

                <JobEntry
                    comapnyLogoUrl = { logoJpeg }
                    employer = { <ExternalLink href = 'https://www.corva.ai/'>Corva.ai</ExternalLink> }
                    position = 'Senior Frontend Engineer'
                    project = 'Geoscience LINK TO EXAMPLES'
                    achievements = { (
                        <ul>
                            <li>Prototyped product's new frontend architecture, mentored team</li>
                            <li>
                                Coordinated the migration from the old tech stack to the new one
                            </li>
                            <li>
                                Implemented the new web-platform MVP using Gatsby.js, Next.js and
                                Strapi CMS
                            </li>
                            <li>Optimized frontend codebase using monorepo</li>
                        </ul>
                      ) }
                    manager = { (
                        <>
                            Artem Sychov —{' '}
                            <ExternalLink href = 'https://www.linkedin.com/in/suchov/'>
                                LinkedIn
                            </ExternalLink>
                            , <ExternalLink href = 'https://t.me/artem_sychov'>Telegram</ExternalLink>
                        </>
                      ) }
                />
                <JobEntry
                    comapnyLogoUrl = { logoJpeg }
                    employer = { <ExternalLink href = 'https://boosta.biz/en/'>Boosta</ExternalLink> }
                    position = 'Senior Frontend Engineer'
                    project = 'Essay'
                    achievements = { (
                        <ul>
                            <li>Re-architected problematic project fundament</li>
                            <li>Project rewrite from JavaScript to TypeScript</li>
                            <li>
                                Introduced best practices of code organization, UI layout
                                principles, performance metrics Conducted platform audit and
                                invested hi-end technical solutions
                            </li>
                            <li>
                                Integrated cutting-edge rust-based tooling to the development
                                toolchain
                            </li>
                        </ul>
                      ) }
                    manager = { (
                        <>
                            Vlad Muzychenko —
                            <ExternalLink href = 'https://www.linkedin.com/in/vladyslav-muzychenko-796392127/'>
                                LinkedIn
                            </ExternalLink>
                            , <ExternalLink href = 'https://t.me/vlmuzychenko'>Telegram</ExternalLink>
                        </>
                      ) }
                />
            </section>
        </main>
    );
};

const Entry = (props: EntryProps) => {
    return (
        <div className = 'entry'>
            <span className = 'name'>{props.name}</span>
            <span className = 'value'>{props.content}</span>
        </div>
    );
};

interface EntryProps {
    name:    string,
    content: string | React.ReactNode,
}

const JobEntry = (props: JobEntryProps) => {
    return (
        <section className = 'job-entry'>
            <Image alt = 'Company logo' src = { props.comapnyLogoUrl } width = { 100 } />

            <Entry content = { props.employer } name = 'employer' />
            <Entry content = { props.position } name = 'position' />
            <Entry content = { props.project } name = 'project' />
            <Entry content = { props.manager } name = 'manager' />
            <Entry content = { props.achievements } name = 'achievements' />
        </section>
    );
};

interface JobEntryProps {
    employer:       string | React.ReactNode,
    position:       string,
    project:        string,
    manager:        string | React.ReactNode,
    achievements:   string | React.ReactNode,
    comapnyLogoUrl: StaticImageData,
}
