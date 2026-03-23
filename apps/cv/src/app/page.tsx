/** biome-ignore-all lint/correctness/noUnusedImports: wip */
'use client';

import { cx } from 'cva';
import { Button } from '@ui/kit/components/button';
import { ExternalLinkSvg } from '@ui/kit/icons/ExternalLinkSvg';
import Image from 'next/image';

import { BriefEntry } from '@/components/BriefEntry';
import { Project } from '@/components/Project';
import { SectionHeading } from '@/components/SectionHeading';

import { ToolSection } from './parts/ToolSection';
import {
  toolListAi,
  toolListAnimations,
  toolListAuth,
  toolListBundlers,
  toolListComponents,
  toolListCore,
  toolListDb,
  toolListLLM,
  toolListNetwork,
  toolListState,
  toolListStyles,
} from './parts/toolConfig';
import meJpeg from '/public/my-photo.jpeg';
import { ExternalLink } from '@/elements';
import { EMAIL_TO } from '@/frags';
import * as links from '@/links';

export default function CVPage() {
  const briefSectionCn = cx(
    'grid grid-cols-[minmax(auto,max-content)_auto] gap-x-4',
  );

  return (
    <main
      className={cx(
        'prose-custom prose-style mx-auto',
        // todo do something with txt size and line height
        'max-w-8xl text-sm/snug',
      )}>
      {/* <Button variant='destructive'>Click me <ExternalLinkSvg /></Button> */}
      {/* <EasyMasonryComponent /> */}
      <SectionHeading accentColor='sky' className='mt-4' text='brief' />

      <article className='grid grid-cols-[1fr_auto] place-items-start'>
        <section className={briefSectionCn}>
          <BriefEntry content='dima vakatsiienko' name='name' />
          <BriefEntry
            className='break-all'
            content={<a href={EMAIL_TO}>{links.ADDRESS_EMAIL_PERSONAL}</a>}
            name='email'
          />
          <BriefEntry content='ukraine, kyiv' name='location' />
          <BriefEntry
            content={
              <>
                <ExternalLink href={links.ADDRESS_CV_FULL}>
                  full cv
                </ExternalLink>
                ,{' '}
                <ExternalLink href={links.ADDRESS_GITHUB_PERSONAL}>
                  github
                </ExternalLink>
                ,{' '}
                <ExternalLink href={links.ADDRESS_LINKEDIN_PERSONAL}>
                  linkedin
                </ExternalLink>
                ,&nbsp;
                <ExternalLink href={links.ADDRESS_TELEGRAM_PERSONAL}>
                  telegram
                </ExternalLink>
              </>
            }
            name='links'
          />
          <BriefEntry
            content='frontend engineer, frontend lead, hybrid'
            name='role'
          />
          <BriefEntry content='english, ukrainian, russian' name='fluent' />
        </section>

        <picture className='relative m-0 hidden aspect-2/3 w-23 sm:block'>
          <Image
            alt='Picture of the author'
            className='select-none rounded-2xl object-cover'
            fill
            placeholder='blur'
            priority
            sizes='10vw'
            src={meJpeg}
          />
        </picture>
      </article>
      <article className='grid grid-flow-dense grid-cols-4 gap-1 sm:grid-cols-9'>
        <SectionHeading
          accentColor='purple'
          className='col-span-full'
          id={links.LINK_ID_CV_TOOLS}
          text='tools I use'
        />

        <ToolSection
          className='col-span-2 sm:col-span-5'
          color='orange'
          title='core'
          toolList={toolListCore}
        />
        <ToolSection
          className='col-span-2 sm:col-span-2'
          color='indigo'
          title='style'
          toolList={toolListStyles}
        />
        <ToolSection
          className='col-span-2 sm:col-span-2'
          color='sky'
          title='state'
          toolList={toolListState}
        />

        <ToolSection
          className='col-span-2 sm:col-span-3'
          color='fuchsia'
          title='network'
          toolList={toolListNetwork}
        />
        <ToolSection
          className='col-span-2 sm:col-span-4'
          color='blue'
          title='components'
          toolList={toolListComponents}
        />
        <ToolSection
          className='col-span-2 sm:col-span-2'
          color='rose'
          title='UX · motion'
          toolList={toolListAnimations}
        />

        <ToolSection
          className='col-span-2 sm:col-span-2'
          color='cyan'
          title='auth'
          toolList={toolListAuth}
        />
        <ToolSection
          className='col-span-2 sm:col-span-4'
          color='purple'
          title='db'
          toolList={toolListDb}
        />
        <ToolSection
          className='col-span-2 sm:col-span-3'
          color='lime'
          title='AI'
          toolList={toolListAi}
        />

        <ToolSection
          className='col-span-2 sm:col-span-4'
          color='violet'
          title='bundlers'
          toolList={toolListBundlers}
        />
        <ToolSection
          className='col-span-2 sm:col-span-5'
          color='emerald'
          title='LLM'
          toolList={toolListLLM}
        />
      </article>
      <article className='grid gap-y-2'>
        <SectionHeading
          accentColor='emerald'
          className='col-span-full'
          text='portfolio'
        />

        <Project
          dates='Jan 2025 – Oct 2025'
          description={
            <p>
              Migrated a 5-year-old{' '}
              <ExternalLink href={links.LINK_TURBO_STARS_SPORTSBOOK}>
                Sportsbook
              </ExternalLink>{' '}
              codebase in severe tech debt state into a modern stack. JavaScript
              → <b>TypeScript</b>, Webpack → <b>Vite</b>, Preact → <b>React</b>.
              Reduced the project size and complexity from ~140k to ~100k LOC,
              replaced SCSS with <b>Tailwind</b>. Coordinated a frontend team of
              3 engineers and improved the team's DX by integrating{' '}
              <b>CodeRabbitAI</b> into self-hosted GitLab.
            </p>
          }
          employer={
            <ExternalLink href={links.LINK_TURBO_STARS}>
              Turbo Stars
            </ExternalLink>
          }
          projectRole='Senior/Lead Frontend Engineer'
        />

        <p className='text-muted-foreground text-xs italic'>
          Oct 2023 – Jan 2025 — health recovery, volunteering with Ukrainian
          armed forces.
        </p>

        <Project
          dates='Jun 2022 – Oct 2023'
          description={
            <>
              <p>
                <b>Keystone</b> (NDA) — drove the technical upgrade of a
                Norway-based oil & gas platform out of a legacy PHP stack:
                introduced <b>TypeScript</b>, built a shared component library
                with <b>Storybook</b>, <b>Vite</b> and <b>React</b>, launched
                cross-team knowledge-sharing sessions, and implemented the first{' '}
                <b>Next.js</b> sub-project as a proof of concept for entire
                platform migration.
              </p>
              <p>
                <ExternalLink href={links.LINK_ANADAEA_ROCKY}>
                  Rocky
                </ExternalLink>{' '}
                — led frontend team for a UGC advertising marketplace. Replaced
                a broken styled-components + MUI setup with <b>Tailwind</b> +{' '}
                <b>Radix/Headless UI</b>, resolved systematic <b>Next.js</b>{' '}
                anti-patterns, and delivered the majority of the production
                codebase. Trained team with architectural best practices.
              </p>
            </>
          }
          employer={
            <ExternalLink href={links.LINK_ANADAEA}>Anadea</ExternalLink>
          }
          projectRole='Senior/Lead Frontend Engineer'
        />

        <Project
          dates='2021 – 2022'
          description={
            <p>
              Built the MVP of Corva's new{' '}
              <ExternalLink href={links.LINK_CORVA_GEOSCIENCE}>
                Geoscience
              </ExternalLink>{' '}
              branch — a geosteering visualization app embedded via iframe into
              the main platform. Joined to resolve a heavy tech debt from a
              previous contractor. Replaced JavaScript with <b>TypeScript</b>,
              eliminated memory leaks degrading live chart performance,
              improving rendering by 20%. Reduced architectural complexity and
              streamlined delivery pace to align with MVP roadmap.
            </p>
          }
          employer={
            <ExternalLink href={links.LINK_CORVA}>Corva.ai</ExternalLink>
          }
          projectRole='Senior Frontend Engineer'
        />

        <Project
          dates='Dec 2020 – May 2021'
          description={
            <p>
              Led the content platform v2 frontend migration out of a legacy PHP
              stack — 67 satellite landing pages funneling into a central
              application, plus an admin panel. Designed the new architecture:{' '}
              <b>Gatsby</b> for static landings, <b>Next.js</b> for the main app
              and admin, <b>Strapi CMS</b> for content.
            </p>
          }
          employer={
            <ExternalLink href={links.LINK_BOOSTA}>Boosta</ExternalLink>
          }
          projectRole='Senior Frontend Engineer'
        />

        <Project
          dates='Dec 2019 – Nov 2020'
          description={
            <p>
              Designed and implemented the{' '}
              <ExternalLink href={links.LINK_TEMY_CCT}>
                Community Capital Technologies Marketplace
              </ExternalLink>{' '}
              (fintech) v2 from scratch with <b>Next.js</b>, <b>Redux</b>, and{' '}
              <b>styled-components</b>, working directly with the client's CTO
              and a UX designer. After four months, interviewed and onboarded a
              frontend developer and two QA engineers joining under my
              coordination, growing the team to 5.
            </p>
          }
          employer={<ExternalLink href={links.LINK_TEMY}>Temy</ExternalLink>}
          projectRole='Senior Frontend Engineer'
        />

        <Project
          dates='Nov 2019 – Apr 2020'
          description={
            <p>
              Alongside main roles, I took on consulting and tutoring
              engagements: frontend course delivery at{' '}
              <ExternalLink href={links.LINK_DAN_IT}>DAN.IT</ExternalLink>,
              platform migration coordination for{' '}
              <ExternalLink href={links.LINK_BUKI}>Buki</ExternalLink> (PHP to{' '}
              <b>Next.js</b>), and a standalone <b>Next.js</b> course
              development at{' '}
              <ExternalLink href={links.LINK_LECTRUM}>Lectrum</ExternalLink>.
            </p>
          }
          employer={
            <>
              <ExternalLink href={links.LINK_BUKI}>Buki</ExternalLink>,{' '}
              <ExternalLink href={links.LINK_DAN_IT}>DAN.IT</ExternalLink>,{' '}
              <ExternalLink href={links.LINK_QA_STARTUP}>
                QA Startup
              </ExternalLink>
              , <ExternalLink href={links.LINK_LECTRUM}>Lectrum</ExternalLink>
            </>
          }
          projectRole='Frontend Team Lead, tutor'
        />

        <Project
          dates='Nov 2016 – Aug 2019'
          description={
            <>
              <p>
                Built an ed-tech startup from the ground up as part of a
                four-person team. Designed and produced the entire frontend
                curriculum — JavaScript, React, Redux, Webpack — and delivered
                it live to student cohorts of 15–20 through online sessions and
                weekend intensives. On the engineering side, built the company's
                web presence with <b>Next.js</b> and LMS platform.
              </p>
              <p>
                Created courses:{' '}
                <ExternalLink href={links.LINK_LECTRUM_COURSE_NEXT_JS}>
                  Next.js
                </ExternalLink>
                , React, JavaScript, Webpack, Redux, Redux Saga, Immutable.js.
              </p>
            </>
          }
          employer={
            <ExternalLink href={links.LINK_LECTRUM}>Lectrum</ExternalLink>
          }
          projectRole='Frontend Engineer, tutor'
        />

        <Project
          dates='Dec 2016 – May 2017'
          description={
            <p>
              Built <b>DBGlass</b> — an open-source Postgres database GUI with{' '}
              <b>React</b>, <b>Redux</b>, and <b>Electron</b>. Transitioned to
              supporting internal tools, then delivered a first production
              client project — an e-commerce platform for a US-based client.
            </p>
          }
          employer={
            <ExternalLink href={links.LINK_WEB_PAL}>Web-pal</ExternalLink>
          }
          projectRole='Frontend Engineer'
        />

        <Project
          dates='Nov 2015 – Dec 2016'
          description={
            <p>
              Started as a dev tester on the{' '}
              <ExternalLink href={links.LINK_WATCH_DOGS_2}>
                Watch Dogs 2
              </ExternalLink>{' '}
              PC port, creating performance testing workflows with data
              visualization dashboards. Promoted to lead a new 11-person QA team
              on{' '}
              <ExternalLink href={links.LINK_UBISOFT_CONNECT}>
                Uplay
              </ExternalLink>
              , designing the entire testing process from scratch.
            </p>
          }
          employer={
            <ExternalLink href={links.LINK_UBISOFT}>Ubisoft</ExternalLink>
          }
          projectRole='Junior Dev Tester, Associate Lead QA'
        />
      </article>
    </main>
  );
}
