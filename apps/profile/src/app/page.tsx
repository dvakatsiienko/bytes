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
                        <a
                            href = 'https://telegra.ph/SeniorLead-Frontend-Developer-10-02'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Cover Letter
                        </a>
                        <a
                            href = 'https://github.com/dvakatsiienko'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Github
                        </a>
                        <a
                            href = 'https://www.linkedin.com/in/dima-vakatsiienko-a20271100/'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Linkedin
                        </a>
                        <a
                            href = 'https://t.me/shining1488'
                            rel = 'noreferrer noopener'
                            target = '_blank'>
                            Telegram
                        </a>
                    </span>
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
                                Headless CMS’s, zshell,, Docker
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
        </main>
    );
};
