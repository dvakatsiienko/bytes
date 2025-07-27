import * as svg from './svg';

export const toolListCore = [
  {
    icon: svg.ESNextSVG,
    name: 'ESNext',
  },
  {
    icon: svg.TypeScriptSVG,
    name: 'TypeScript',
  },
  {
    icon: svg.NodeSVG,
    name: 'Node',
  },
  {
    icon: svg.ReactSVG,
    name: 'React',
  },
  {
    icon: svg.NextSVG,
    name: 'Next',
  },
];

export const toolListAuth = [
  {
    icon: svg.ClerkSVG,
    name: 'Clerk',
  },
  {
    icon: svg.NextAuthSVG,
    name: 'NextAuth',
  },
];

export const toolListState = [
  {
    icon: svg.JotaiSVG,
    name: 'Jotai',
  },
  {
    icon: svg.ZustandSVG,
    name: 'Zustand',
  },
];

export const toolListNetwork = [
  {
    icon: svg.ReactQuerySVG,
    name: 'Query',
  },
  {
    icon: svg.GraphQLSVG,
    name: 'GraphQL',
  },
  {
    icon: svg.VercelSVG,
    name: 'Vercel',
  },
];

export const toolListDb = [
  {
    icon: svg.PrismaSVG,
    name: 'Prisma',
  },
  {
    icon: svg.PostgreSVG,
    name: 'Postgre',
  },
  {
    icon: svg.SQLiteSVG,
    name: 'SQLite',
  },
  {
    icon: svg.ConvexSVG,
    name: 'Convex',
  },
];

export const toolListStyles = [
  {
    icon: svg.TailwindSVG,
    name: 'Tailwind',
  },
  {
    icon: svg.CssSVG,
    name: 'CSS',
  },
];

export const toolListComponents = [
  {
    icon: svg.RadixUiSVG,
    name: 'Radix UI',
  },
  {
    icon: svg.ChadcnSVG,
    name: 'Chadcn UI',
  },
  {
    icon: svg.HeadlessUISVG,
    name: 'Headless UI',
  },
  {
    icon: svg.StorybookSVG,
    name: 'Storybook',
  },
];

export const toolListAnimations = [
  {
    icon: svg.FigmaSVG,
    name: 'Figma',
  },
  {
    icon: svg.MotionSVG,
    name: 'motion.dev',
  },
];

export const toolListAi = [
  {
    icon: svg.PerplexityAiSVG,
    name: 'Perplexity',
  },
  {
    icon: svg.CursorLightSVG,
    name: 'Cursor',
  },
  {
    icon: svg.CodeRabbitSVG,
    name: 'CodeRabbit',
  },
];

export const toolListBundlers = [
  {
    icon: svg.ViteSVG,
    name: 'Vite',
  },
  {
    icon: svg.SwcSVG,
    name: 'swc',
  },
  {
    icon: svg.ESBuildSVG,
    name: 'esbuild',
  },
  {
    icon: svg.WebpackSVG,
    name: 'Webpack',
  },
];

export const toolListLLM = [
  {
    icon: svg.VercelSVG,
    name: 'Vercel AI',
  },
  {
    icon: svg.OpenAiSVG,
    name: 'OpenAI',
  },
  {
    icon: svg.AnthropicSVG,
    name: 'Anthropic',
  },
  {
    icon: svg.GroqAiSVG,
    name: 'Groq',
  },
  {
    icon: svg.OpenRouterAaSVG,
    name: 'OpenRouter',
  },
];

// TODO delete if not used
export const toolListCodeQuality = [
  {
    icon: svg.ESNextSVG,
    name: 'ESLint',
  },
  {
    icon: svg.PrettierSVG,
    name: 'Prettier',
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
