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
                'prose prose-sm prose-neutral sm:prose-base lg:prose-lg xl:prose-xl dark:prose-invert',
            )}>
            <h2>Hi there,</h2>

            <p>I'm Dima, a Frontend Engineer.</p>

            <p>
                With <b>{yearExperience} years</b> of experience in <b>frontend development</b>, including specialized
                expertise in <b>React ({yearExperienceReact} years)</b>, <b>Next.js ({yearExperienceNextjs} years)</b>,
                and <b>TypeScript ({yearExperienceTypescript} years)</b>—I am eager to contribute my technical skills
                and collaborative mindset to your team.
            </p>

            <p>
                My expertise: - Languages & Frameworks: JavaScript/TypeScript, React, Next.js, Vite - State Management:
                React-Query, Apollo GraphQL, Jotai, Zustand, Redux - Styling & Animation: Tailwind, Styled Components,
                motion.dev, Radix UI, Headless UI, chadcn/ui - LLM & prompt engineering: Vercel AI SDK, OpenAI, GroQ,
                OpenRouter - Tools: Figma, Storybook, NPM module publishing
            </p>

            <p>
                Key Achievements: - Architected high-performance solutions with a focus on maintainability and
                robustness - Led platform redesigns, migrating legacy systems to modern tech stacks with up to 40%
                faster load times post-optimization - Built shared component libraries adopted across organizations,
                reducing development time by 20% - Mentored junior developers, improving team code quality and
                productivity
            </p>

            <p>I thrive in environments that value user-centric design, technical precision and great UX.</p>

            <p>
                There is my CV attached with additional details. I welcome the opportunity to discuss how my experience
                can support your team’s objectives.
            </p>

            <p>
                Also, check my most recent side project: an AI-driven chat app, X-COM Chat.
                https://x-com-chat.vercel.app/
            </p>

            <p>I would be glad to know more about this role!</p>

            <p>Best regards, Dima Vakatsiienko</p>
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

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko Cover',
    description: 'Dima Vakatsiienko Cover, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
