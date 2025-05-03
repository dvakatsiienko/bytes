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
        <section
            className={cx(
                'mx-auto max-w-7xl',
                // 'px-8 pb-4 pt-8',
                'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl dark:prose-invert',
            )}>
            <h2>Hi there,</h2>

            <p>I'm Dima, a Frontend Engineer.</p>

            <p>
                With <b>{yearExperience} years</b> of experience in <b>frontend development</b>, including specialized
                expertise with <b>{yearExperienceReact} years of React</b>,{' '}
                <b>{yearExperienceNextjs} years of Next.js</b>, <b>{yearExperienceTypescript} years of TypeScript</b>{' '}
                and <b>{yearExperienceTailwind} years of Tailwind</b> — I am eager to contribute my skills and
                collaborative mindset to a great team and product.
            </p>

            <p>
                Behind me there are many successful projects with emphasis on high-quality functionality, UI/UX, and
                simplicity.
            </p>

            <p>
                I look for a cool new project, maybe a startup, to build a great consumer product. <br /> Check out my
                most recent side project: an AI-driven{' '}
                <a target='_blank' rel='noopener noreferrer' href={process.env.NEXT_PUBLIC_X_COM_CHAT_LINK}>
                    X-COM Chat
                </a>
                , where each character has its own personality. 👽 <br />
                Look into my{' '}
                <a target='_blank' rel='noopener noreferrer' href='https://github.com/dvakatsiienko'>
                    GitHub
                </a>{' '}
                for more projects.
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

            <div
                className={cx(
                    'fixed bottom-4 right-4 flex h-12 items-center justify-center rounded-md px-4',
                    'dark:bg-surface-1 bg-surface-4 print:hidden',
                )}>
                Write me on&nbsp;<a href={process.env.NEXT_PUBLIC_ADDRESS_TELEGRAM}>Telegram</a>&nbsp;or by an&nbsp;
                <a href='mailto:imagnum.satellite@gmail.com'>email</a>.
            </div>
        </section>
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
