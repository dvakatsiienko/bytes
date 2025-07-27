
import * as svg from './svg';

export const toolListCore = [
    {
        name: 'ESNext',
        icon: svg.ESNextSVG,
    },
    {
        name: 'TypeScript',
        icon: svg.TypeScriptSVG,
    },
    {
        name: 'Node',
        icon: svg.NodeSVG,
    },
    {
        name: 'React',
        icon: svg.ReactSVG,
    },
    {
        name: 'Next',
        icon: svg.NextSVG,
    },
];

export const toolListAuth = [
    {
        name: 'Clerk',
        icon: svg.ClerkSVG,
    },
    {
        name: 'NextAuth',
        icon: svg.NextAuthSVG,
    },
];

export const toolListState = [
    {
        name: 'Jotai',
        icon: svg.JotaiSVG,
    },
    {
        name: 'Zustand',
        icon: svg.ZustandSVG,
    },
];

export const toolListNetwork = [
    {
        name: 'Query',
        icon: svg.ReactQuerySVG,
    },
    {
        name: 'GraphQL',
        icon: svg.GraphQLSVG,
    },
    {
        name: 'Vercel',
        icon: svg.VercelSVG,
    },
];

export const toolListDb = [
    {
        name: 'Prisma',
        icon: svg.PrismaSVG,
    },
    {
        name: 'Postgre',
        icon: svg.PostgreSVG,
    },
    {
        name: 'SQLite',
        icon: svg.SQLiteSVG,
    },
    {
        name: 'Convex',
        icon: svg.ConvexSVG,
    },
];

export const toolListStyles = [
    {
        name: 'Tailwind',
        icon: svg.TailwindSVG,
    },
    {
        name: 'CSS',
        icon: svg.CssSVG,
    },
];

export const toolListComponents = [
    {
        name: 'Radix UI',
        icon: svg.RadixUiSVG,
    },
    {
        name: 'Chadcn UI',
        icon: svg.ChadcnSVG,
    },
    {
        name: 'Headless UI',
        icon: svg.HeadlessUISVG,
    },
    {
        name: 'Storybook',
        icon: svg.StorybookSVG,
    },
];

export const toolListAnimations = [
    {
        name: 'Figma',
        icon: svg.FigmaSVG,
    },
    {
        name: 'motion.dev',
        icon: svg.MotionSVG,
    },
];

export const toolListAi = [
    {
        name: 'Perplexity',
        icon: svg.PerplexityAiSVG,
    },
    {
        name: 'Cursor',
        icon: svg.CursorLightSVG,
    },
    {
        name: 'CodeRabbit',
        icon: svg.CodeRabbitSVG,
    },
];

export const toolListBundlers = [
    {
        name: 'Vite',
        icon: svg.ViteSVG,
    },
    {
        name: 'swc',
        icon: svg.SwcSVG,
    },
    {
        name: 'esbuild',
        icon: svg.ESBuildSVG,
    },
    {
        name: 'Webpack',
        icon: svg.WebpackSVG,
    },
];

export const toolListLLM = [
    {
        name: 'Vercel AI',
        icon: svg.VercelSVG,
    },
    {
        name: 'OpenAI',
        icon: svg.OpenAiSVG,
    },
    {
        name: 'Anthropic',
        icon: svg.AnthropicSVG,
    },
    {
        name: 'Groq',
        icon: svg.GroqAiSVG,
    },
    {
        name: 'OpenRouter',
        icon: svg.OpenRouterAaSVG,
    },
];

// TODO delete if not used
export const toolListCodeQuality = [
    {
        name: 'ESLint',
        icon: svg.ESNextSVG,
    },
    {
        name: 'Prettier',
        icon: svg.PrettierSVG,
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
