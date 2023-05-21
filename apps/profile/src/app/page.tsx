/* Core */
import Image from 'next/image';

/* Components */
import { ExternalLink } from '@/app/elements';

/* Instruments */
import styles from './index-page.module.scss';

export default () => {
    return (
        <main className = { styles.profile }>
            <h1>Profile</h1>
            <section>
                <div>
                    <span className = 'key'>name</span>
                    <span className = 'value'>Dima Vakatsiienko</span>
                </div>

                <div>
                    <span className = 'key'>email</span>
                    <span className = 'value'>imagnum.satellite@gmail.com</span>
                </div>

                <div>
                    <span className = 'key'>location</span>
                    <span className = 'value'>Ukraine, Kyiv</span>
                </div>

                <div>
                    <span className = 'key'>links</span>
                    <span className = 'value'>
                        <ExternalLink href = 'https://telegra.ph/SeniorLead-Frontend-Developer-10-02'>
                            Cover Letter
                        </ExternalLink>
                        <ExternalLink href = 'https://github.com/dvakatsiienko'>Github</ExternalLink>
                        <ExternalLink href = 'https://www.linkedin.com/in/dima-vakatsiienko-a20271100/'>
                            Linkedin
                        </ExternalLink>
                        <ExternalLink href = 'https://t.me/shining1488'>Telegram</ExternalLink>
                    </span>

                    <Image
                        fill
                        alt = 'Picture of the author'
                        blurDataURL = '/my-photo.jpeg'
                        placeholder = 'blur'
                        src = '/my-photo.jpeg'
                        style = {{ objectFit: 'contain' }}
                    />
                </div>
            </section>

            <section>
                <div>
                    <span className = 'key'>desired position</span>
                    <span className = 'value'>
                        Frontend developer, frontend team/tech lead, hybrid
                    </span>
                </div>

                <div>
                    <span className = 'key'>Objective</span>
                    <span className = 'value'>
                        Hello! I have a deep expertise of modern web development. As a tutor I’ve
                        taught over 500+ students with cutting edge JavaScript, React, Next.js,
                        Redux, Redux Saga, webpack, Immutable.js and Flowtype. My goal is to join a
                        great team of enthusiasts who want to write perfect code and develop top
                        notch web applications of the future.
                    </span>
                </div>
            </section>

            <section>
                <h1>Skills</h1>

                <div>
                    <span className = 'key'>Core</span>
                    <span className = 'value'>
                        <ul>
                            <li>
                                ★ ★ ★ ★ ★ — ESNext, TypeScript, React, Next.js, Redux, Apollo
                                GraphQL, react-query, webpack
                            </li>
                        </ul>
                        <ul>
                            <li>
                                ★ ★ ★ ★ ☆ — Gatsby.js, Jest, Enzyme, REST, backend processes, Vercel
                            </li>
                        </ul>
                        <ul>
                            <li>
                                ★ ★ ★ ☆ ☆ — Node.js, Prisma, express.js, MongoDB, Mongoose.js,
                                Headless CMS's, zshell,, Docker
                            </li>
                        </ul>
                    </span>
                </div>

                <div>
                    <span className = 'key'>Peripheral</span>
                    <span className = 'value'>
                        <ul>
                            <li>★ ★ ★ ★ ★ — styled-components, , sass, PostCSS, yarn, npm, pnpm</li>
                        </ul>
                        <ul>
                            <li>★ ★ ★ ★ ☆ — HTML, CSS, Figma, Adobe XD, Zepplin</li>
                        </ul>
                        <ul>
                            <li>★ ★ ★ ☆ ☆ — mobile first, responsive fluid design</li>
                        </ul>
                    </span>
                </div>

                <div>
                    <span className = 'key'>Other</span>
                    <span className = 'value'>
                        <ul>
                            <li>Rich tutoring and mentoring experience</li>
                        </ul>
                        <ul>
                            <li>
                                Rich online/offline live performance experience — webinars,
                                workshops, courses
                            </li>
                        </ul>
                        <ul>
                            <li>Good understanding of QA processes</li>
                        </ul>
                        <ul>
                            <li>Development workflow management experience</li>
                        </ul>
                    </span>
                </div>
            </section>

            <section>
                <h1>Portfolio</h1>

                <div style = {{ position: 'relative' }}>
                    <span className = 'key'>employer</span>
                    <span className = 'value'>
                        <ExternalLink href = 'https://www.corva.ai/'>Corva.ai</ExternalLink>
                    </span>

                    <Image
                        fill
                        alt = 'Picture of the author'
                        blurDataURL = '/logo.jpeg'
                        placeholder = 'blur'
                        src = '/logo.jpeg'
                        style = {{ objectFit: 'contain' }}
                    />
                </div>

                <div>
                    <span className = 'key'>position</span>
                    <span className = 'value'>Senior Frontend Engineer</span>
                </div>

                <div>
                    <span className = 'key'>project</span>
                    <span className = 'value'>Geoscience LINK TO EXAMPLES</span>
                </div>

                <div>
                    <span className = 'key'>manager</span>
                    <span className = 'value'>
                        Artem Sychov —{' '}
                        <ExternalLink href = 'https://www.linkedin.com/in/suchov/'>
                            LinkedIn
                        </ExternalLink>
                        , <ExternalLink href = 'https://t.me/artem_sychov'>Telegram</ExternalLink>
                    </span>
                </div>

                <div>
                    <span className = 'key'>achievements</span>
                    <span className = 'value'>
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
                    </span>
                </div>

                <div style = {{ position: 'relative' }}>
                    <span className = 'key'>employer</span>
                    <span className = 'value'>
                        <ExternalLink href = 'https://boosta.biz/en/'>Boosta</ExternalLink>
                    </span>

                    <Image
                        fill
                        alt = 'Picture of the author'
                        blurDataURL = '/logo.jpeg'
                        placeholder = 'blur'
                        src = '/logo.jpeg'
                        style = {{ objectFit: 'contain' }}
                    />
                </div>

                <div>
                    <span className = 'key'>position</span>
                    <span className = 'value'>Senior Frontend Engineer</span>
                </div>

                <div>
                    <span className = 'key'>project</span>
                    <span className = 'value'>Essay</span>
                </div>

                <div>
                    <span className = 'key'>manager</span>
                    <span className = 'value'>
                        Vlad Muzychenko —
                        <ExternalLink href = 'https://www.linkedin.com/in/vladyslav-muzychenko-796392127/'>
                            LinkedIn
                        </ExternalLink>
                        , <ExternalLink href = 'https://t.me/vlmuzychenko'>Telegram</ExternalLink>
                    </span>
                </div>

                <div>
                    <span className = 'key'>achievements</span>
                    <span className = 'value'>
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
                    </span>
                </div>
            </section>
        </main>
    );
};
