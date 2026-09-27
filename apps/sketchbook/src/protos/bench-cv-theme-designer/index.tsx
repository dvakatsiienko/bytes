/* Core */
import { motion, useReducedMotion } from 'motion/react';

/* Instruments */
import {
  cover,
  linkList,
  person,
  projectList,
  toolGroupList,
} from '../_cv-data';

export const protoMeta = {
  question: 'cv via theme-designer',
  title: 'cv · theme-designer',
};

export const Proto = () => {
  const reactYearCount = new Date().getFullYear() - 2016;

  const linkListJSX = linkList.map((link) => {
    return (
      <li key={link.label}>
        <a
          className='inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[13px] text-muted-foreground transition-[color,background-color,transform] duration-500 ease-lux hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98]'
          href={link.href}
          rel='noreferrer'
          target={link.href.startsWith('mailto') ? undefined : '_blank'}>
          {link.label}
          <span aria-hidden className='text-[12px] opacity-60'>
            ↗
          </span>
        </a>
      </li>
    );
  });

  const factListJSX = factList.map((fact) => {
    return (
      <div
        className='flex items-baseline justify-between gap-6 py-3'
        key={fact.label}>
        <dt className='font-mono text-[12px] text-muted-foreground uppercase tracking-[0.18em]'>
          {fact.label}
        </dt>
        <dd className='text-right text-[14px] tabular-nums'>
          {fact.label === 'react' ? `${reactYearCount} years` : fact.value}
        </dd>
      </div>
    );
  });

  const toolGroupListJSX = toolGroupList.map((group) => {
    const toolListJSX = group.toolList.map((tool) => {
      return (
        <li
          className='rounded-full border bg-background px-2.5 py-1 text-[13px] leading-none'
          key={tool}>
          {tool}
        </li>
      );
    });

    return (
      <div
        className='grid gap-2 border-t py-4 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[7.5rem_1fr] sm:gap-6'
        key={group.name}>
        <dt className='font-mono text-[12px] text-muted-foreground uppercase tracking-[0.18em] sm:pt-1.5'>
          {group.name}
        </dt>
        <dd>
          <ul className='flex flex-wrap gap-1.5'>{toolListJSX}</ul>
        </dd>
      </div>
    );
  });

  const projectListJSX = projectList.map((project, index) => {
    if (project.role === 'gap') {
      return (
        <Reveal key={project.dates}>
          <div className='grid gap-2 px-6 py-5 sm:grid-cols-[9.5rem_1fr] sm:gap-8'>
            <p className='font-mono text-[12px] text-muted-foreground tabular-nums tracking-[0.06em]'>
              {project.dates}
            </p>
            <p className='font-lux-serif text-[17px] text-muted-foreground italic leading-snug'>
              {project.description}
            </p>
          </div>
        </Reveal>
      );
    }

    return (
      <Reveal key={project.dates}>
        <Bezel>
          <article className='grid gap-4 p-6 sm:grid-cols-[9.5rem_1fr] sm:gap-8 sm:p-8'>
            <div className='flex flex-col gap-1.5'>
              <p className='font-mono text-[12px] text-muted-foreground tabular-nums tracking-[0.06em]'>
                {project.dates}
              </p>
              <p className='font-mono text-[12px] text-muted-foreground tabular-nums'>
                {String(projectList.length - index).padStart(2, '0')}
              </p>
            </div>
            <div>
              <h3 className='font-lux-serif text-[24px] leading-tight tracking-[-0.01em] sm:text-[26px]'>
                <a
                  className='underline decoration-1 decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-500 ease-lux hover:decoration-current focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4'
                  href={project.href}
                  rel='noreferrer'
                  target='_blank'>
                  {project.employer}
                </a>
              </h3>
              <p className='mt-1 text-[14px] text-muted-foreground'>
                {project.role}
              </p>
              <p className='mt-4 text-[15px] leading-relaxed'>
                {project.description}
              </p>
            </div>
          </article>
        </Bezel>
      </Reveal>
    );
  });

  return (
    <div className='relative min-h-screen bg-background font-lux-sans text-foreground'>
      <Grain />

      <div className='mx-auto max-w-[1180px] px-4 pt-14 pb-24 sm:px-8 md:pt-24 md:pb-32'>
        <div className='grid gap-16 md:grid-cols-12 md:gap-x-10'>
          <aside className='md:sticky md:top-16 md:col-span-5 md:self-start'>
            <Reveal>
              <span className='inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[12px] text-accent-foreground uppercase tracking-[0.2em]'>
                <span
                  aria-hidden
                  className='size-1.5 rounded-full bg-current'
                />
                open to work · {person.location}
              </span>
              <h1 className='mt-8 font-lux-serif text-[56px] leading-[0.92] tracking-[-0.03em] sm:text-[72px] md:text-[76px]'>
                dima
                <br />
                <span className='text-primary italic'>vakatsiienko</span>
              </h1>
              <p className='mt-6 max-w-[28ch] text-[17px] text-muted-foreground leading-relaxed'>
                {person.role}. i ship consumer-facing frontends and lead small
                teams that ship them too.
              </p>
              <ul className='mt-8 flex flex-wrap gap-2'>{linkListJSX}</ul>
            </Reveal>

            <Reveal delay={0.12}>
              <div className='mt-12'>
                <Bezel>
                  <dl className='divide-y px-6 py-3'>{factListJSX}</dl>
                </Bezel>
              </div>
            </Reveal>
          </aside>

          <section className='md:col-span-7'>
            <Reveal>
              <p className='font-lux-serif text-[30px] leading-[1.15] tracking-[-0.02em] sm:text-[38px]'>
                {cover.greeting}
              </p>
              <p className='mt-6 text-[17px] leading-relaxed sm:text-[18px]'>
                {cover.intro}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className='mt-10'>
                <Bezel tone='accent'>
                  <div className='p-6 sm:p-8'>
                    <Eyebrow>looking for</Eyebrow>
                    <p className='mt-4 text-[16px] leading-relaxed sm:text-[17px]'>
                      {cover.lookingFor}
                    </p>
                    <div className='mt-6 flex flex-wrap items-center gap-4'>
                      <a
                        className='group inline-flex items-center gap-3 rounded-full bg-primary py-2 pr-2 pl-6 text-[15px] text-primary-foreground transition-transform duration-500 ease-lux focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4 active:scale-[0.98]'
                        href={`mailto:${person.email}`}>
                        say hi
                        <span
                          aria-hidden
                          className='grid size-8 place-items-center rounded-full bg-white/15 text-[14px] transition-transform duration-500 ease-lux group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105'>
                          ↗
                        </span>
                      </a>
                      <a
                        className='text-[14px] text-muted-foreground underline decoration-1 underline-offset-4 transition-colors duration-500 ease-lux hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4'
                        href={cover.sideProject.href}
                        rel='noreferrer'
                        target='_blank'>
                        latest side project · {cover.sideProject.label}
                      </a>
                    </div>
                  </div>
                </Bezel>
              </div>
            </Reveal>

            <Reveal>
              <div className='mt-24'>
                <Eyebrow>toolkit</Eyebrow>
                <h2 className='mt-4 font-lux-serif text-[30px] leading-tight tracking-[-0.02em]'>
                  what i reach for
                </h2>
                <div className='mt-8'>
                  <Bezel>
                    <dl className='p-6 sm:p-8'>{toolGroupListJSX}</dl>
                  </Bezel>
                </div>
              </div>
            </Reveal>

            <div className='mt-24'>
              <Reveal>
                <Eyebrow>work</Eyebrow>
                <h2 className='mt-4 font-lux-serif text-[30px] leading-tight tracking-[-0.02em]'>
                  ten years of shipping
                </h2>
              </Reveal>
              <div className='mt-8 flex flex-col gap-4'>{projectListJSX}</div>
            </div>
          </section>
        </div>

        <footer className='mt-24 flex flex-wrap items-center justify-between gap-3 border-t pt-6 font-mono text-[12px] text-muted-foreground'>
          <span>
            {person.name} · {person.location}
          </span>
          <span>fluent in {person.fluent.join(', ')}</span>
        </footer>
      </div>
    </div>
  );
};

/* Components */
const Bezel = (props: BezelProps) => {
  const shellClass = props.tone === 'accent' ? 'bg-accent/60' : 'bg-lux-shell';

  return (
    <div
      className={`rounded-[2rem] p-1.5 ring-1 ring-foreground/[0.06] ${shellClass}`}>
      <div className='rounded-[calc(2rem-0.375rem)] bg-card shadow-lux'>
        {props.children}
      </div>
    </div>
  );
};

const Eyebrow = (props: { children: React.ReactNode }) => {
  return (
    <span className='inline-flex rounded-full border px-3 py-1 font-mono text-[12px] text-muted-foreground uppercase tracking-[0.2em]'>
      {props.children}
    </span>
  );
};

const Reveal = (props: RevealProps) => {
  const isReduced = useReducedMotion();

  return (
    <motion.div
      initial={isReduced ? false : { filter: 'blur(6px)', opacity: 0, y: 24 }}
      transition={{
        delay: props.delay ?? 0,
        duration: 0.8,
        ease: [0.32, 0.72, 0, 1],
      }}
      viewport={{ margin: '0px 0px -40px 0px', once: true }}
      whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}>
      {props.children}
    </motion.div>
  );
};

const Grain = () => {
  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-0 z-10 opacity-[0.035] mix-blend-multiply dark:mix-blend-screen'
      style={{ backgroundImage: grainUrl, backgroundSize: '180px 180px' }}
    />
  );
};

/* Helpers */
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}")`;

const factList = [
  { label: 'react', value: '' },
  { label: 'speaks', value: person.fluent.join(' · ') },
  { label: 'off duty', value: 'trophy hunter · lvl 301 · 34 platinums' },
] as const;

/* Types */
interface BezelProps {
  children: React.ReactNode;
  tone?: 'accent' | 'paper';
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
}
