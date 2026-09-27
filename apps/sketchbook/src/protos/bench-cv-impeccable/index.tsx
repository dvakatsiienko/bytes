/* Core */
import { ArrowUpRight } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';

/* Instruments */
import {
  cover,
  linkList,
  person,
  projectList,
  toolGroupList,
} from '../_cv-data';
import './theme.css';

export const protoMeta = {
  question: 'cv via impeccable',
  title: 'cv · impeccable',
};

export const Proto = () => {
  return (
    <MotionConfig reducedMotion='user'>
      <div className='font-sans text-(--ink) text-[15px] leading-relaxed lg:grid lg:grid-cols-[18rem_1fr]'>
        <Sidebar />
        <div className='min-w-0'>
          <Hero />
          <main className='mx-auto max-w-5xl px-6 lg:mx-0 lg:max-w-4xl lg:px-10'>
            <Briefing />
            <Missions />
            <Kit />
          </main>
          <Comms />
        </div>
      </div>
    </MotionConfig>
  );
};

/* ≥1024: the jacket's identity half stays pinned while the log scrolls. */
const Sidebar = () => {
  return (
    <aside className='hidden bg-(--field) text-(--field-ink) lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-8 lg:py-10'>
      <h1 className='cv-display font-semibold text-[2rem] leading-[0.95]'>
        {person.name}
      </h1>
      <p className='cv-narrow mt-4 text-lg leading-snug'>{person.role}</p>

      <dl className='mt-8 border-(--field-ink)/20 border-b [&>div]:grid-cols-1 [&>div]:gap-0.5 [&>div]:py-2.5'>
        <PropertyRowList list={sidebarPropertyList} />
      </dl>

      <div className='mt-6'>
        <CommsLinkList />
      </div>

      <p className='mt-auto pt-8 font-mono text-(--field-ink-2) text-xs uppercase tracking-[0.14em]'>
        {person.location} · {yearCurrent}
      </p>
    </aside>
  );
};

/* The green hero band: the whole jacket below 1024, its working half above. */
const Hero = () => {
  const railListJSX = serviceList.map((service, index) => {
    return (
      <ServiceRail
        delay={0.2 + index * 0.06}
        key={service.name}
        name={service.name}
        since={service.since}
      />
    );
  });

  return (
    <section
      aria-label='dossier'
      className='cv-field bg-(--field) pt-14 pb-20 md:pt-12 md:pb-12 lg:pt-10 lg:pb-16'>
      <div className='mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-[1.15fr_0.85fr] md:gap-16 lg:mx-0 lg:max-w-4xl lg:grid-cols-[1fr_0.9fr] lg:gap-12 lg:px-10'>
        <div>
          <h1 className='cv-display font-semibold text-(--field-ink) text-[2.5rem] leading-[0.95] md:text-[4rem] lg:hidden'>
            {person.name}
          </h1>
          <p className='cv-narrow mt-4 max-w-[34ch] text-(--field-ink) text-xl leading-snug md:text-2xl lg:mt-0 lg:text-[2.5rem]'>
            {cover.greeting}
          </p>
          <div className='mt-5'>
            <p className='inline-flex items-center gap-2 rounded-full border border-(--field-ink)/50 px-3 py-1 font-mono text-(--field-ink) text-xs uppercase tracking-[0.14em]'>
              <span
                aria-hidden
                className='size-1.5 rounded-full bg-(--field-ink)'
              />
              available · {yearCurrent}
            </p>
          </div>

          <dl className='mt-8 border-(--field-ink)/20 border-b lg:mt-6'>
            <div className='lg:hidden'>
              <PropertyRowList list={identityPropertyList} />
            </div>
            <PropertyRowList list={heroPropertyList} />
          </dl>
        </div>

        <div className='md:pt-3 lg:pt-0'>
          <h2 className='cv-narrow text-(--field-ink-2) text-base uppercase tracking-[0.08em]'>
            years in service
          </h2>
          <ul className='mt-3'>{railListJSX}</ul>

          <div className='mt-8 lg:hidden'>
            <CommsLinkList />
          </div>
        </div>
      </div>
    </section>
  );
};

const PropertyRowList = (props: PropertyRowListProps) => {
  const rowListJSX = props.list.map((property) => {
    return (
      <div
        className='grid grid-cols-[6.5rem_1fr] gap-4 border-(--field-ink)/20 border-t py-2'
        key={property.label}>
        <dt className='pt-0.5 font-mono text-(--field-ink-2) text-xs uppercase tracking-[0.14em]'>
          {property.label}
        </dt>
        <dd className='text-(--field-ink)'>
          {property.href ? (
            <a
              className='inline-flex items-center gap-0.5 underline decoration-(--field-ink)/40 hover:decoration-(--field-ink)'
              href={property.href}
              rel='noreferrer'
              target='_blank'>
              {property.value}
              <ArrowUpRight aria-hidden className='size-3.5' />
            </a>
          ) : (
            property.value
          )}
        </dd>
      </div>
    );
  });

  return <>{rowListJSX}</>;
};

const ServiceRail = (props: ServiceRailProps) => {
  const years = yearCurrent - props.since;

  const tickListJSX = railTickList.map((tick) => {
    const isOn = tick <= years;

    return (
      <motion.span
        animate={{ opacity: 1 }}
        aria-hidden
        className={`h-3.5 w-2 rounded-[1px] ${isOn ? 'bg-(--field-ink)' : 'bg-(--field-ink)/25'}`}
        initial={{ opacity: 0 }}
        key={tick}
        transition={{ delay: props.delay + tick * 0.03, duration: 0.25 }}
      />
    );
  });

  return (
    <li
      aria-label={`${props.name}, ${years} years`}
      className='grid grid-cols-[6.5rem_1fr_auto] items-center gap-4 border-(--field-ink)/20 border-t py-2.5'>
      <span className='font-mono text-(--field-ink) text-xs uppercase tracking-[0.14em]'>
        {props.name}
      </span>
      <span className='flex gap-1' role='presentation'>
        {tickListJSX}
      </span>
      <span className='font-mono text-(--field-ink-2) text-xs tabular-nums'>
        {years}y
      </span>
    </li>
  );
};

const Briefing = () => {
  return (
    <section className='grid gap-6 py-16 md:grid-cols-[6.5rem_1fr] md:gap-12 md:pt-16 md:pb-24'>
      <SectionTitle>briefing</SectionTitle>
      <div className='max-w-[60ch] space-y-5 text-[17px] leading-relaxed'>
        <p>{cover.intro}</p>
        <p>{cover.lookingFor}</p>
        <p className='text-(--ink-2)'>
          {cover.sideProject.text}{' '}
          <a
            className='inline-flex items-center gap-0.5 text-(--moss) underline hover:decoration-2'
            href={cover.sideProject.href}
            rel='noreferrer'
            target='_blank'>
            {cover.sideProject.label}
            <ArrowUpRight aria-hidden className='size-3.5' />
          </a>
        </p>
      </div>
    </section>
  );
};

const Missions = () => {
  const missionListJSX = projectList.map((project, index) => {
    const isGap = project.role === 'gap';

    return (
      <motion.li
        animate={{ opacity: 1, y: 0 }}
        className={`grid gap-2 border-(--rule) border-t py-5 md:grid-cols-[13rem_1fr] md:gap-8 ${isGap ? 'text-(--ink-2)' : ''}`}
        initial={{ opacity: 0, y: 6 }}
        key={project.dates}
        transition={{
          delay: 0.08 + index * 0.04,
          duration: 0.3,
          ease: 'easeOut',
        }}>
        <span className='flex flex-col gap-1'>
          <span className='font-mono text-(--ink-2) text-[13px] tabular-nums'>
            {project.dates}
          </span>
          {isGap ? (
            <span className='font-mono text-[13px] uppercase tracking-[0.14em]'>
              off duty
            </span>
          ) : (
            <span className='flex flex-col gap-0.5'>
              <a
                className='w-fit font-medium underline decoration-(--rule) hover:decoration-(--moss)'
                href={project.href}
                rel='noreferrer'
                target='_blank'>
                {project.employer}
              </a>
              <span className='text-(--ink-2) text-[13px]'>{project.role}</span>
            </span>
          )}
        </span>
        <p className={`max-w-[68ch] ${isGap ? 'italic' : ''}`}>
          {project.description}
        </p>
      </motion.li>
    );
  });

  return (
    <section className='grid gap-6 pb-16 md:grid-cols-[6.5rem_1fr] md:gap-12 md:pb-24'>
      <SectionTitle>missions</SectionTitle>
      <ol className='border-(--rule) border-b'>{missionListJSX}</ol>
    </section>
  );
};

const Kit = () => {
  const groupListJSX = toolGroupList.map((group, groupIndex) => {
    const toolListJSX = group.toolList.map((tool, index) => {
      return (
        <span className='inline-flex items-center' key={tool}>
          {index > 0 ? (
            <span
              aria-hidden
              className='mx-2.5 size-1 rounded-full bg-(--moss)'
            />
          ) : null}
          {tool}
        </span>
      );
    });

    return (
      <div
        className={`grid gap-1 py-3 md:grid-cols-[9rem_1fr] md:gap-6 ${groupIndex > 0 ? 'border-(--rule) border-t' : ''}`}
        key={group.name}>
        <dt className='font-mono text-(--ink-2) text-xs uppercase tracking-[0.14em] md:pt-1'>
          {group.name}
        </dt>
        <dd className='flex flex-wrap'>{toolListJSX}</dd>
      </div>
    );
  });

  return (
    <section className='grid gap-6 pb-20 md:grid-cols-[6.5rem_1fr] md:gap-12 md:pb-28'>
      <SectionTitle>kit</SectionTitle>
      <dl className='rounded-xl border border-(--rule) bg-(--card) px-5 py-1 shadow-(--shadow-card) md:px-6'>
        {groupListJSX}
      </dl>
    </section>
  );
};

const CommsLinkList = () => {
  const linkListJSX = linkList.map((link) => {
    const isExternal = link.href.startsWith('http');

    return (
      <li key={link.label}>
        <a
          className='inline-flex items-center gap-1 rounded-full border border-(--field-ink)/40 px-3 py-1 font-mono text-(--field-ink) text-xs uppercase tracking-[0.14em] hover:border-(--field-ink) hover:bg-(--field-ink)/10'
          href={link.href}
          rel={isExternal ? 'noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}>
          {link.label}
          {isExternal ? <ArrowUpRight aria-hidden className='size-3' /> : null}
        </a>
      </li>
    );
  });

  return <ul className='flex flex-wrap gap-2'>{linkListJSX}</ul>;
};

const Comms = () => {
  return (
    <footer className='bg-(--field) py-12 md:py-16 lg:hidden'>
      <div className='mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-[6.5rem_1fr] md:gap-12'>
        <h2 className='cv-narrow text-(--field-ink-2) text-base uppercase tracking-[0.08em]'>
          comms
        </h2>
        <div>
          <CommsLinkList />
          <p className='mt-6 text-(--field-ink-2) text-[13px]'>
            {person.location} · {yearCurrent}
          </p>
        </div>
      </div>
    </footer>
  );
};

const SectionTitle = (props: SectionTitleProps) => {
  return (
    <h2 className='cv-display font-semibold text-(--ink) text-2xl leading-none md:sticky md:top-6 md:self-start'>
      {props.children}
    </h2>
  );
};

/* Helpers */
const yearCurrent = new Date().getFullYear();
const railTickList = Array.from({ length: 10 }, (_, index) => index + 1);

// The same start years cover.intro spells out in prose.
const serviceList = [
  { name: 'react', since: 2016 },
  { name: 'next', since: 2018 },
  { name: 'typescript', since: 2017 },
  { name: 'tailwind', since: 2022 },
] as const satisfies readonly Service[];

const identityPropertyList = [
  { label: 'role', value: person.role },
  { label: 'base', value: person.location },
  { label: 'fluent', value: person.fluent.join(' · ') },
] as const satisfies readonly Property[];

const sidebarPropertyList = identityPropertyList.filter((property) => {
  return property.label !== 'role';
});

const heroPropertyList = [
  {
    label: 'ships',
    value: 'bytes monorepo · an agent fleet around claude code',
  },
  {
    href: 'https://trophy-sys.vercel.app',
    label: 'off duty',
    value: 'trophy hunter · level 301 · 34 platinums',
  },
] as const satisfies readonly Property[];

/* Types */
interface PropertyRowListProps {
  list: readonly Property[];
}

interface ServiceRailProps {
  delay: number;
  name: string;
  since: number;
}

interface SectionTitleProps {
  children: string;
}

interface Service {
  name: string;
  since: number;
}

interface Property {
  href?: string;
  label: string;
  value: string;
}
