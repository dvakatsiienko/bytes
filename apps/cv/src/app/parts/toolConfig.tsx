/* Components */
import * as svg from './svg';

export const toolListCore = [
    {
        name: 'ESNext',
        icon: svg.ESNext,
    },
    {
        name: 'TypeScript',
        icon: svg.TypeScript,
    },
    {
        name: 'Node',
        icon: svg.Node,
    },
    {
        name: 'React',
        icon: svg.React,
    },
    {
        name: 'Next',
        icon: svg.Next,
    },
];

export const toolListAuth = [
    {
        name: 'Clerk',
        icon: svg.Clerk,
    },
    {
        name: 'NextAuth',
        icon: svg.NextAuth,
    },
];

export const toolListState = [
    {
        name: 'Jotai',
        icon: svg.Jotai,
    },
    {
        name: 'Zustand',
        icon: svg.Zustand,
    },
];

export const toolListNetwork = [
    {
        name: 'Query',
        icon: svg.ReactQuery,
    },
    {
        name: 'GraphQL',
        icon: svg.GraphQL,
    },
    {
        name: 'Vercel',
        icon: svg.Vercel,
    },
];

export const toolListDb = [
    {
        name: 'Prisma',
        icon: svg.Prisma,
    },
    {
        name: 'Postgre',
        icon: svg.PostgreSQL,
    },
    {
        name: 'SQLite',
        icon: svg.SQLite,
    },
    {
        name: 'Convex',
        icon: svg.Convex,
    },
];

export const toolListStyles = [
    {
        name: 'Tailwind',
        icon: svg.Tailwind,
    },
    {
        name: 'CSS',
        icon: svg.CSS,
    },
];

export const toolListComponents = [
    {
        name: 'Radix UI',
        icon: svg.RadixUI,
    },
    {
        name: 'Chadcn UI',
        icon: svg.ChadCN,
    },
    {
        name: 'Headless UI',
        icon: svg.HeadlessUI,
    },
    {
        name: 'Storybook',
        icon: svg.Storybook,
    },
];

export const toolListAnimations = [
    {
        name: 'Figma',
        icon: svg.Figma,
    },
    {
        name: 'motion.dev',
        icon: svg.Motion,
    },
];

export const toolListAi = [
    {
        name: 'Perplexity',
        icon: svg.PerplexityAI,
    },
    {
        name: 'Cursor',
        icon: svg.Cursor,
    },
    {
        name: 'CodeRabbit',
        icon: svg.CodeRabbit,
    },
];

export const toolListBundlers = [
    {
        name: 'Vite',
        icon: svg.Vite,
    },
    {
        name: 'swc',
        icon: svg.Swc,
    },
    {
        name: 'esbuild',
        icon: svg.Esbuild,
    },
    {
        name: 'Webpack',
        icon: svg.Webpack,
    },
];

export const toolListLLM = [
    {
        name: 'Vercel AI',
        icon: svg.Vercel,
    },
    {
        name: 'OpenAI',
        icon: svg.OpenAI,
    },
    {
        name: 'Anthropic',
        icon: svg.Anthropic,
    },
    {
        name: 'Groq',
        icon: svg.GroqAI,
    },
    {
        name: 'OpenRouter',
        icon: svg.OpenRouter,
    },
];

// TODO delete if not used
export const toolListCodeQuality = [
    {
        name: 'ESLint',
        icon: svg.ESLint,
    },
    {
        name: 'Prettier',
        icon: svg.Prettier,
    },
];

// TODO delete if not used
export const stuff = [
    {
        area: 'core',
        toolList: toolListCore,
    },
    // {
    //     area: 'frameworks',
    //     toolList: toolListFrameworks,
    // },
    {
        area: 'auth',
        toolList: toolListAuth,
    },
    {
        area: 'state',
        toolList: toolListState,
    },
    {
        area: 'styles',
        toolList: toolListStyles,
    },
    {
        area: 'animations',
        toolList: toolListLLM,
    },
    {
        area: 'AI',
        toolList: toolListLLM,
    },
];

export type Stuff = (typeof stuff)[number];

export type ITool =
    | (typeof toolListCore)[number]
    | (typeof toolListState)[number]
    | (typeof toolListStyles)[number]
    | (typeof toolListLLM)[number];
