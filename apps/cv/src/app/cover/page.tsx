/* Core */
import { cx } from 'cva';
import type { Metadata } from 'next';

/* Components */
import { ExternalLink } from '@/elements/ExternalLink';

/* Instruments */
import { EMAIL_TO } from '@/falgs';

export default function CoverPage() {
    return (
        <main className={cx('prose-custom prose-style prose-hr:mb-6 mx-auto')}>
            <h3 className='mt-4'>Hi there, I'm Dima. I do Frontend.</h3>
            <hr />

            <p>
                I bring <b>{yearExperience} years</b> of <b>frontend development</b> experience, with deep expertise in{' '}
                <b>React ({yearExperienceReact} years)</b>, <b>Next.js ({yearExperienceNextjs} years)</b>,{' '}
                <b>TypeScript ({yearExperienceTypescript} years)</b> and{' '}
                <b>Tailwind ({yearExperienceTailwind} years)</b>. I’ve delivered many successful projects, focusing on
                high-quality functionality, clean UI/UX, and simplicity — challenges included.
            </p>

            <p>
                I’m looking for a cool new project, maybe a startup, where I can help build an awesome consumer-facing
                product. I’m excited to join a great team where I can put my skills and collaborative spirit to work on
                something impactful.
            </p>

            <p>
                👽 Check out my latest side project: an AI-driven{' '}
                <ExternalLink href={process.env.NEXT_PUBLIC_LINK_X_COM_CHAT}>X-COM Chat</ExternalLink>, where each
                character has its own personality. <br />
            </p>
            <blockquote>
                💡 You can find more of my work on&nbsp;
                <ExternalLink href={process.env.NEXT_PUBLIC_ADDRESS_GITHUB}>GitHub</ExternalLink>.
            </blockquote>

            <p>
                Let's{' '}
                <a target='_blank' rel='noopener noreferrer' href={EMAIL_TO}>
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
        </main>
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
