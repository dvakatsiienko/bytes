/* Core */
import { cx } from 'cva';
import type { Metadata } from 'next';

// prose-slate	Slate
// prose-zinc	Zinc
// prose-neutral	Neutral
// prose-stone	Stone
//

export default function CoverPage() {
    return (
        <>
            <section
                className={cx(
                    'mx-auto max-w-7xl',
                    'prose prose-a:text-link prose-sm sm:prose-base lg:prose-lg xl:prose-xl dark:prose-invert',
                )}>
                {/* <div
                    className={cx(
                        'sticky -right-0 top-0 z-10 flex h-12 w-max items-center justify-center rounded-md px-4',
                        'dark:bg-background-header bg-surface-4 print:hidden',
                    )}>
                    Write me on&nbsp;<a href={process.env.NEXT_PUBLIC_ADDRESS_TELEGRAM}>Telegram</a>&nbsp;or by an&nbsp;
                    <a href='mailto:imagnum.satellite@gmail.com'>email</a>.
                </div> */}

                <h2>Hi there,</h2>

                <p>I'm Dima, a Frontend Engineer.</p>

                <p>
                    I bring <b>{yearExperience} years</b> of <b>frontend development</b> experience, with deep expertise
                    in <b>React ({yearExperienceReact} years)</b>, <b>Nex.js ({yearExperienceNextjs} years)</b>,{' '}
                    <b>TypeScript ({yearExperienceTypescript} years)</b> and{' '}
                    <b>Tailwind ({yearExperienceTailwind} years)</b>. I’m excited to join a great team where I can put
                    my skills and collaborative spirit to work on something impactful.
                </p>

                <p>
                    I’ve delivered many successful projects, focusing on high-quality functionality, clean UI/UX, and
                    simplicity.
                </p>

                <p>
                    I’m looking for a cool new project, maybe a startup, where I can help build an awesome consumer
                    product. <br /> Check out my latest side project: an AI-driven{' '}
                    <a target='_blank' rel='noopener noreferrer' href={process.env.NEXT_PUBLIC_X_COM_CHAT_LINK}>
                        X-COM Chat
                    </a>
                    , where each character has its own personality. 👽 <br />
                    You can find more of my work on&nbsp;
                    <a target='_blank' rel='noopener noreferrer' href='https://github.com/dvakatsiienko'>
                        GitHub
                    </a>
                    .
                </p>

                <p>
                    Let's{' '}
                    <a target='_blank' rel='noopener noreferrer' href='mailto:imagnum.satellite@gmail.com'>
                        meet and talk
                    </a>
                    . 😁
                </p>

                <h3>My main tools</h3>

                <ul className='list-inside list-disc'>
                    {techStack.map(({ category, items }) => (
                        <li key={category}>
                            <b>{category}</b>: {items.join(', ')}
                        </li>
                    ))}
                </ul>

                <h3>My key achievements</h3>

                <ul className='list-inside list-disc'>
                    {keyAchievements.map((achievement) => (
                        <li key={achievement}>{achievement}</li>
                    ))}
                </ul>
            </section>
        </>
    );
}

/* Helpers */
const YEAR_CAREER_START = 2016;

const yearCurrent = new Date().getFullYear();
const yearExperience = yearCurrent - YEAR_CAREER_START;

const YEAR_STARTED_REACT = 2016;
const yearExperienceReact = yearCurrent - YEAR_STARTED_REACT;

const YEAR_STARTED_NEXTJS = 2018;
const yearExperienceNextjs = yearCurrent - YEAR_STARTED_NEXTJS;

const YEAR_STARTED_TYPESCRIPT = 2017;
const yearExperienceTypescript = yearCurrent - YEAR_STARTED_TYPESCRIPT;

const YEAR_STARTED_TAILWIND = 2022;
const yearExperienceTailwind = yearCurrent - YEAR_STARTED_TAILWIND;

const keyAchievements = [
    'Architected high-performance solutions with a focus on maintainability and robustness',
    'Led platform redesigns, migrating legacy systems to modern tech stacks with up to 40% faster load times post-optimization',
    'Built shared component libraries adopted across organizations, reducing development time by 20%',
    'Mentored teammates, improving code quality and productivity',
];

const techStack = [
    {
        category: 'Languages & Frameworks',
        items: ['JavaScript/TypeScript', 'React', 'Next.js App Router', 'Vite'],
    },
    {
        category: 'State & Network',
        items: ['React-Query', 'Apollo GraphQL', 'Jotai', 'Zustand', 'Redux'],
    },
    {
        category: 'Styling & Animation',
        items: ['Tailwind', 'motion.dev', 'Radix UI', 'Headless UI', 'chadcn/ui', 'Styled Components'],
    },
    {
        category: 'LLM prompt engineering',
        items: ['Vercel AI SDK', 'OpenAI', 'GroQ', 'OpenRouter'],
    },
    {
        category: 'Tools',
        items: ['Figma', 'Storybook', 'NPM module publishing'],
    },
];

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko Cover',
    description: 'Dima Vakatsiienko Cover, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
