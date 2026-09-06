import { motion, useReducedMotion } from 'motion/react';

import {
  cover,
  linkList,
  person,
  projectList,
  toolGroupList,
} from '../_cv-data';

import './taste.css';

export const protoMeta = {
  question: 'cv via taste',
  title: 'cv · taste',
};

export const Proto = () => {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? false : { opacity: 0, y: 12 };

  const linkListJSX = linkList.map((link) => {
    return (
      <li key={link.label}>
        <a
          className='inline-flex min-h-9 items-center rounded-md border border-(--line) bg-(--surface) px-3 font-mono text-(--ink) text-sm transition-colors hover:border-(--leaf) hover:text-(--leaf) focus-visible:outline-(--leaf) focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px'
          href={link.href}
          rel='noreferrer'
          target='_blank'>
          {link.label}
        </a>
      </li>
    );
  });

  const toolGroupListJSX = toolGroupList.map((group) => {
    const chipListJSX = group.toolList.map((tool) => {
      return (
        <li
          className='rounded-md bg-(--tint) px-2.5 py-1 text-(--ink) text-sm'
          key={tool}>
          {tool}
        </li>
      );
    });

    return (
      <li className='flex flex-col gap-2' key={group.name}>
        <span className='font-mono text-(--ink-soft) text-xs'>
          {group.name}
        </span>
        <ul className='flex flex-wrap gap-1.5'>{chipListJSX}</ul>
      </li>
    );
  });

  const projectListJSX = projectList.map((project, index) => {
    const isGap = project.role === 'gap';

    return (
      <motion.li
        animate={{ opacity: 1, y: 0 }}
        className='grid gap-2 border-(--line) border-l pl-6 md:grid-cols-[10rem_1fr] md:gap-8'
        initial={rise}
        key={project.dates}
        transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}>
        <span className='font-mono text-(--ink-soft) text-sm tabular-nums'>
          {project.dates}
        </span>
        {isGap ? (
          <p className='text-(--ink-soft) text-sm'>{project.description}</p>
        ) : (
          <div className='flex flex-col gap-2'>
            <h3 className='font-medium text-(--ink) text-base leading-snug'>
              {project.role}
              <span className='text-(--ink-soft)'> at </span>
              <a
                className='text-(--leaf) underline decoration-(--line) underline-offset-4 transition-colors hover:decoration-(--leaf) focus-visible:outline-(--leaf) focus-visible:outline-2 focus-visible:outline-offset-2'
                href={project.href}
                rel='noreferrer'
                target='_blank'>
                {project.employer}
              </a>
            </h3>
            <p className='max-w-[65ch] text-(--ink-soft) text-sm leading-relaxed'>
              {project.description}
            </p>
          </div>
        )}
      </motion.li>
    );
  });

  return (
    <div className='min-h-[100dvh] lg:grid lg:grid-cols-[19rem_1fr]'>
      <aside className='flex flex-col gap-8 border-(--line) border-b px-5 py-8 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:px-8 lg:py-10'>
        <div>
          <h1 className='font-display font-semibold text-(--ink) text-3xl leading-none tracking-tight'>
            {person.name}
          </h1>
          <p className='mt-3 max-w-[30ch] text-(--ink-soft) text-sm leading-relaxed'>
            {person.role}
          </p>
        </div>

        <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
          <dt className='font-mono text-(--ink-soft) text-xs leading-6'>
            based in
          </dt>
          <dd className='text-(--ink)'>{person.location}</dd>
          <dt className='font-mono text-(--ink-soft) text-xs leading-6'>
            speaks
          </dt>
          <dd className='text-(--ink)'>{person.fluent.join(', ')}</dd>
        </dl>

        <ul className='flex flex-wrap gap-2'>{linkListJSX}</ul>
      </aside>

      <main className='flex flex-col border-(--line) lg:border-l'>
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className='bg-(--moss) px-5 pt-12 pb-20 text-(--moss-ink) [clip-path:polygon(0_0,100%_0,100%_calc(100%-2.5rem),0_100%)] lg:px-14 lg:pt-20 lg:pb-28'
          initial={rise}
          transition={{ duration: 0.4, ease: 'easeOut' }}>
          <h2 className='max-w-[18ch] font-display font-semibold text-4xl leading-[1.05] tracking-tight lg:text-6xl'>
            {cover.greeting}
          </h2>
          <p className='mt-6 max-w-[60ch] text-base leading-relaxed lg:text-lg'>
            {cover.intro}
          </p>
        </motion.section>

        <section className='px-5 py-10 lg:px-14 lg:py-14'>
          <p className='max-w-[60ch] text-(--ink) text-base leading-relaxed lg:text-lg'>
            {cover.lookingFor}
          </p>
          <p className='mt-4 max-w-[60ch] text-(--ink-soft) text-base leading-relaxed'>
            {cover.sideProject.text}{' '}
            <a
              className='text-(--leaf) underline decoration-(--line) underline-offset-4 transition-colors hover:decoration-(--leaf) focus-visible:outline-(--leaf) focus-visible:outline-2 focus-visible:outline-offset-2'
              href={cover.sideProject.href}
              rel='noreferrer'
              target='_blank'>
              {cover.sideProject.label}
            </a>
          </p>
        </section>

        <section className='border-(--line) border-t px-5 py-10 lg:px-14 lg:py-14'>
          <h2 className='font-display font-semibold text-(--ink) text-2xl tracking-tight'>
            tools I use
          </h2>
          <ul className='mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 xl:grid-cols-3'>
            {toolGroupListJSX}
          </ul>
        </section>

        <section className='border-(--line) border-t px-5 py-10 lg:px-14 lg:py-14'>
          <h2 className='font-display font-semibold text-(--ink) text-2xl tracking-tight'>
            portfolio
          </h2>
          <ol className='mt-8 flex flex-col gap-10'>{projectListJSX}</ol>
        </section>
      </main>
    </div>
  );
};
