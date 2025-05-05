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
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Convex',
        icon: 'https://tailwindcss.com/icon.png',
    },
];

export const toolListStyles = [
    {
        name: 'Tailwind',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Radix UI',
        icon: svg.RadixUI,
    },
    {
        name: 'Chadcn UI',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Headless UI',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Figma',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Storybook',
        icon: 'https://tailwindcss.com/icon.png',
    },
];

export const toolListAnimations = [
    {
        name: 'motion.dev',
        icon: 'https://tailwindcss.com/icon.png',
    },
];

export const toolListAi = [
    {
        name: 'Vercel AI',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'OpenAI',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'GroQ',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'OpenRouter',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Claude',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Perplexity',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Cursor',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'CodeRabbit',
        icon: 'https://tailwindcss.com/icon.png',
    },
];

export const toolListBundlers = [
    {
        name: 'swc',
        icon: 'swc',
    },
    {
        name: 'esbuild',
        icon: 'esbuild',
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
