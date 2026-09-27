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
import { ledgerList } from './data';
import './theme.css';

export const protoMeta = {
  question: 'cv via frontend-design',
  title: 'cv · frontend-design',
};

export const Proto = () => {
  const reduceMotion = useReducedMotion();

  const ledgerListJSX = ledgerList.map((row, index) => {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className='grid grid-cols-[6.5rem_1fr] gap-x-3 border-(--fd-rail-rule) border-t py-2.5 first:border-t-0'
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        key={row.label}
        transition={{ delay: 0.12 + index * 0.05, duration: 0.3 }}>
        <dt className='text-(--fd-rail-dim) text-sm'>{row.label}</dt>
        <dd className='text-(--fd-rail-ink) text-sm'>{row.value}</dd>
      </motion.div>
    );
  });

  const linkListJSX = linkList.map((link) => {
    return (
      <li key={link.label}>
        <a
          className='cursor-pointer text-(--fd-rail-ink) text-sm underline decoration-(--fd-rail-rule) underline-offset-4 hover:decoration-(--fd-ice)'
          href={link.href}
          rel='noreferrer'
          target='_blank'>
          {link.label}
        </a>
      </li>
    );
  });

  const projectListJSX = projectList.map((project) => {
    const isGap = project.role === 'gap';

    return (
      <li
        className='grid gap-x-8 gap-y-1 border-(--fd-stone) border-t py-6 md:grid-cols-[9rem_1fr]'
        key={project.dates}>
        <p className='text-(--fd-dim) text-sm leading-6'>{project.dates}</p>
        {isGap ? (
          <p className='text-(--fd-dim) italic leading-6'>
            {project.description}
          </p>
        ) : (
          <div className='max-w-[62ch]'>
            <p className='text-base leading-6'>
              <a
                className='cursor-pointer font-medium underline decoration-(--fd-stone) underline-offset-4 hover:decoration-(--fd-moss)'
                href={project.href}
                rel='noreferrer'
                target='_blank'>
                {project.employer}
              </a>
            </p>
            <p className='text-(--fd-dim) text-sm leading-6'>{project.role}</p>
            <p className='mt-2 text-(--fd-ink) text-[0.9375rem] leading-6'>
              {project.description}
            </p>
          </div>
        )}
      </li>
    );
  });

  const toolGroupListJSX = toolGroupList.map((group) => {
    return (
      <div
        className='grid grid-cols-[6.5rem_1fr] gap-x-4 border-(--fd-stone) border-t py-3'
        key={group.name}>
        <dt className='text-(--fd-dim) text-sm leading-6'>{group.name}</dt>
        <dd className='text-sm leading-6'>{group.toolList.join(', ')}</dd>
      </div>
    );
  });

  return (
    <div className='min-h-screen lg:grid lg:grid-cols-[21rem_1fr]'>
      <aside className='bg-(--fd-rail) px-6 py-10 text-(--fd-rail-ink) lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-12'>
        <h1 className='font-(family-name:--fd-display) text-[2.5rem] leading-[1.02] tracking-tight lg:text-5xl'>
          {person.name}
        </h1>
        <p className='mt-3 text-(--fd-rail-dim) text-base leading-6'>
          {person.role}
        </p>

        <dl className='mt-10'>{ledgerListJSX}</dl>

        <ul className='mt-10 flex flex-wrap gap-x-5 gap-y-2'>{linkListJSX}</ul>
      </aside>

      <div className='px-6 py-12 lg:px-16 lg:py-20'>
        <section className='max-w-[62ch]'>
          <h2 className='font-(family-name:--fd-display) text-[2.25rem] italic leading-[1.05] tracking-tight lg:text-[3.5rem]'>
            {cover.greeting}
          </h2>
          <p className='mt-8 text-[1.0625rem] leading-7'>{cover.intro}</p>
          <p className='mt-5 text-[1.0625rem] leading-7'>{cover.lookingFor}</p>
          <p className='mt-5 text-[1.0625rem] leading-7'>
            {cover.sideProject.text}{' '}
            <a
              className='cursor-pointer font-medium text-(--fd-moss) underline decoration-(--fd-moss)/40 underline-offset-4 hover:decoration-(--fd-moss)'
              href={cover.sideProject.href}
              rel='noreferrer'
              target='_blank'>
              {cover.sideProject.label}
            </a>
          </p>
        </section>

        <section className='mt-20'>
          <h2 className='font-(family-name:--fd-display) mb-6 text-3xl leading-none tracking-tight'>
            Work
          </h2>
          <ul className='border-(--fd-stone) border-b'>{projectListJSX}</ul>
        </section>

        <section className='mt-20 max-w-[62ch]'>
          <h2 className='font-(family-name:--fd-display) mb-6 text-3xl leading-none tracking-tight'>
            Tools
          </h2>
          <dl className='border-(--fd-stone) border-b'>{toolGroupListJSX}</dl>
        </section>

        <footer className='mt-20 text-(--fd-dim) text-sm leading-6'>
          <a
            className='cursor-pointer underline decoration-(--fd-stone) underline-offset-4 hover:decoration-(--fd-moss)'
            href={`mailto:${person.email}`}>
            {person.email}
          </a>
        </footer>
      </div>
    </div>
  );
};
