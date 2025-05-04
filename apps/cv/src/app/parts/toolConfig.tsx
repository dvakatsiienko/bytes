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
        name: 'Node.js',
        icon: svg.Node,
    },
    {
        name: 'React',
        icon: svg.React,
    },
    {
        name: 'Next.js',
        icon: svg.Next,
    },
    {
        name: 'Vite',
        icon: svg.Vite,
    },
];

export const toolListState = [
    {
        name: 'Apollo GraphQL',
        icon: svg.GraphQL,
    },
    {
        name: 'React Query',
        icon: svg.ReactQuery,
    },
    {
        name: 'Jotai',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Zustand',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'Prisma',
        icon: 'https://tailwindcss.com/icon.png',
    },
    {
        name: 'PostgreSQL',
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
        icon: 'https://tailwindcss.com/icon.png',
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
        name: 'motion.dev',
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
];

export type ITool =
    | (typeof toolListCore)[number]
    | (typeof toolListState)[number]
    | (typeof toolListStyles)[number]
    | (typeof toolListAnimations)[number];
