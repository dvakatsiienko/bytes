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
];

export const toolListFrameworks = [
    {
        name: 'Next',
        icon: svg.Next,
    },
    {
        name: 'Vite',
        icon: svg.Vite,
    },
];

export const toolListAuth = [
    {
        name: 'Clerk',
        icon: svg.Clerk,
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
        name: 'Apollo GraphQL',
        icon: svg.GraphQL,
    },
    {
        name: 'React Query',
        icon: svg.ReactQuery,
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
        name: 'PostgreSQL',
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
        name: 'Figma',
        icon: svg.Figma,
    },
    {
        name: 'Storybook',
        icon: svg.Storybook,
    },
];

export const toolListAnimations = [
    {
        name: 'motion.dev',
        icon: svg.Motion,
    },
];

export const toolListAi = [
    {
        name: 'Vercel AI',
        icon: svg.Vercel,
    },
    {
        name: 'OpenAI',
        icon: svg.OpenAI,
    },
    {
        name: 'Groq',
        icon: svg.GroqAI,
    },
    {
        name: 'OpenRouter',
        icon: svg.OpenRouter,
    },
    {
        name: 'Claude',
        icon: svg.ClaudeAI,
    },
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

export const stuff = [
    {
        area: 'core',
        toolList: toolListCore,
    },
    {
        area: 'frameworks',
        toolList: toolListFrameworks,
    },
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
        toolList: toolListAi,
    },
    {
        area: 'AI',
        toolList: toolListAi,
    },
];

export type Stuff = (typeof stuff)[number];

export type ITool =
    | (typeof toolListCore)[number]
    | (typeof toolListState)[number]
    | (typeof toolListStyles)[number]
    | (typeof toolListAi)[number];
