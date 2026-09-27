// Dima's cv content, copied from apps/cv (page.tsx, parts/toolConfig.tsx,
// links.ts, cover/page.tsx). Plain data, one source for every bench lane.

const yearCurrent = new Date().getFullYear();

export const person = {
  email: 'imagnum.satellite@gmail.com',
  fluent: ['english', 'ukrainian', 'russian'],
  location: 'ukraine, kyiv',
  name: 'dima vakatsiienko',
  role: 'frontend engineer, frontend lead, hybrid',
} as const;

export const linkList = [
  { href: 'mailto:imagnum.satellite@gmail.com', label: 'email' },
  { href: 'https://github.com/dvakatsiienko', label: 'github' },
  {
    href: 'https://www.linkedin.com/in/dmytro-vakatsiienko-a20271100',
    label: 'linkedin',
  },
  { href: 'https://t.me/shining1488', label: 'telegram' },
  {
    href: 'https://drive.google.com/open?id=1hlhqwEpXVNv_0f8y2R93nGn6bVNE1hmv&usp=drive_fs',
    label: 'full cv',
  },
] as const satisfies readonly Link[];

export const cover = {
  greeting: "Hi there, I'm Dima. I do Frontend.",
  intro: `I bring ${yearCurrent - 2016} years of frontend development experience, with deep expertise in React (${yearCurrent - 2016} years), Next.js (${yearCurrent - 2018} years), TypeScript (${yearCurrent - 2017} years) and Tailwind (${yearCurrent - 2022} years). I've delivered many successful projects, focusing on high-quality functionality, clean UI/UX, and simplicity — challenges included.`,
  lookingFor:
    "I'm looking for a cool new project, maybe a startup, where I can help build an awesome consumer-facing product. I'm excited to join a great team where I can put my skills and collaborative spirit to work on something impactful.",
  sideProject: {
    href: 'https://x-com-chat.vercel.app',
    label: 'X-COM Chat',
    text: 'Check out my latest side project: an AI-driven X-COM Chat, where each character has its own personality.',
  },
} as const;

export const toolGroupList = [
  { name: 'core', toolList: ['ESNext', 'TypeScript', 'Node', 'React', 'Next'] },
  { name: 'style', toolList: ['Tailwind', 'CSS'] },
  { name: 'state', toolList: ['Jotai', 'Zustand'] },
  { name: 'network', toolList: ['Query', 'GraphQL', 'Vercel'] },
  {
    name: 'components',
    toolList: ['Radix UI', 'shadcn/ui', 'Headless UI', 'Storybook'],
  },
  { name: 'UX · motion', toolList: ['Figma', 'motion.dev'] },
  { name: 'auth', toolList: ['Clerk', 'NextAuth'] },
  { name: 'db', toolList: ['Prisma', 'Postgres', 'SQLite', 'Convex'] },
  { name: 'AI', toolList: ['Claude', 'Perplexity', 'CodeRabbit'] },
  { name: 'bundlers', toolList: ['Vite', 'swc', 'esbuild', 'Webpack'] },
  {
    name: 'LLM',
    toolList: ['Anthropic', 'Vercel AI', 'OpenAI', 'Groq', 'OpenRouter'],
  },
] as const satisfies readonly ToolGroup[];

export const projectList = [
  {
    dates: 'Jan 2025 – Oct 2025',
    description:
      'Migrated a 5-year-old Sportsbook codebase in severe tech debt state into a modern stack. JavaScript → TypeScript, Webpack → Vite, Preact → React. Reduced the project size and complexity from ~140k to ~100k LOC, replaced SCSS with Tailwind. Coordinated a frontend team of 3 engineers and improved the team’s DX by integrating CodeRabbitAI into self-hosted GitLab.',
    employer: 'Turbo Stars',
    href: 'https://turbostars.io/',
    role: 'Senior/Lead Frontend Engineer',
  },
  {
    dates: 'Oct 2023 – Jan 2025',
    description: 'Health recovery, volunteering with Ukrainian armed forces.',
    employer: '',
    href: '',
    role: 'gap',
  },
  {
    dates: 'Jun 2022 – Oct 2023',
    description:
      'Keystone (NDA) — drove the technical upgrade of a Norway-based oil & gas platform out of a legacy PHP stack: introduced TypeScript, built a shared component library with Storybook, Vite and React, launched cross-team knowledge-sharing sessions, and implemented the first Next.js sub-project as a proof of concept for entire platform migration. Rocky — led frontend team for a UGC advertising marketplace. Replaced a broken styled-components + MUI setup with Tailwind + Radix/Headless UI, resolved systematic Next.js anti-patterns, and delivered the majority of the production codebase. Trained team with architectural best practices.',
    employer: 'Anadea',
    href: 'https://anadea.info/',
    role: 'Senior/Lead Frontend Engineer',
  },
  {
    dates: '2021 – 2022',
    description:
      'Built the MVP of Corva’s new Geoscience branch — a geosteering visualization app embedded via iframe into the main platform. Joined to resolve a heavy tech debt from a previous contractor. Replaced JavaScript with TypeScript, eliminated memory leaks degrading live chart performance, improving rendering by 20%. Reduced architectural complexity and streamlined delivery pace to align with MVP roadmap.',
    employer: 'Corva.ai',
    href: 'https://www.corva.ai/',
    role: 'Senior Frontend Engineer',
  },
  {
    dates: 'Dec 2020 – May 2021',
    description:
      'Led the content platform v2 frontend migration out of a legacy PHP stack — 67 satellite landing pages funneling into a central application, plus an admin panel. Designed the new architecture: Gatsby for static landings, Next.js for the main app and admin, Strapi CMS for content.',
    employer: 'Boosta',
    href: 'https://boosta.biz/',
    role: 'Senior Frontend Engineer',
  },
  {
    dates: 'Dec 2019 – Nov 2020',
    description:
      'Designed and implemented the Community Capital Technologies Marketplace (fintech) v2 from scratch with Next.js, Redux, and styled-components, working directly with the client’s CTO and a UX designer. After four months, interviewed and onboarded a frontend developer and two QA engineers joining under my coordination, growing the team to 5.',
    employer: 'Temy',
    href: 'https://www.temy.co/',
    role: 'Senior Frontend Engineer',
  },
  {
    dates: 'Nov 2019 – Apr 2020',
    description:
      'Alongside main roles, I took on consulting and tutoring engagements: frontend course delivery at DAN.IT, platform migration coordination for Buki (PHP to Next.js), and a standalone Next.js course development at Lectrum.',
    employer: 'Buki, DAN.IT, QA Startup, Lectrum',
    href: 'https://buki.com.ua/en/',
    role: 'Frontend Team Lead, tutor',
  },
  {
    dates: 'Nov 2016 – Aug 2019',
    description:
      'Built an ed-tech startup from the ground up as part of a four-person team. Designed and produced the entire frontend curriculum — JavaScript, React, Redux, Webpack — and delivered it live to student cohorts of 15–20 through online sessions and weekend intensives. On the engineering side, built the company’s web presence with Next.js and LMS platform. Created courses: Next.js, React, JavaScript, Webpack, Redux, Redux Saga, Immutable.js.',
    employer: 'Lectrum',
    href: 'https://lectrum.io/',
    role: 'Frontend Engineer, tutor',
  },
  {
    dates: 'Dec 2016 – May 2017',
    description:
      'Built DBGlass — an open-source Postgres database GUI with React, Redux, and Electron. Transitioned to supporting internal tools, then delivered a first production client project — an e-commerce platform for a US-based client.',
    employer: 'Web-pal',
    href: 'https://web-pal.com/',
    role: 'Frontend Engineer',
  },
  {
    dates: 'Nov 2015 – Dec 2016',
    description:
      'Started as a dev tester on the Watch Dogs 2 PC port, creating performance testing workflows with data visualization dashboards. Promoted to lead a new 11-person QA team on Uplay, designing the entire testing process from scratch.',
    employer: 'Ubisoft',
    href: 'https://www.ubisoft.com/en-us',
    role: 'Junior Dev Tester, Associate Lead QA',
  },
] as const satisfies readonly Project[];

/* Types */
interface Link {
  href: string;
  label: string;
}

interface ToolGroup {
  name: string;
  toolList: readonly string[];
}

interface Project {
  dates: string;
  description: string;
  employer: string;
  href: string;
  role: string;
}
