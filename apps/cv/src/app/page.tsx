/** biome-ignore-all lint/correctness/noUnusedImports: wip */
'use client';

import { Fragment } from 'react';
import { cx } from 'cva';
import { Button } from '@ui/kit/components/button';
// import { Masonry } from 'masonic';
// import { EasyMasonryComponent } from './EasyMasonryComponent';
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
import logoJpeg from '/public/logo.jpeg';
import meJpeg from '/public/my-photo.jpeg';
import { ExternalLink } from '@/elements';
import { __DEV__, EMAIL_TO } from '@/frags';
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
      {__DEV__ && (
        <>
          {/* TODO extract and reuse article grid cn */}
          <article className='grid grid-cols-2 place-items-start gap-x-2 gap-y-2'>
            <SectionHeading
              accentColor='emerald'
              className='col-span-full'
              text='projects'
            />

            {/* turbo stars */}
            {/* Jan 2025 - Present */}
            <Project
              achievementList={[
                'Upgraded the legacy Frontend build pipeline to a modern standards',
                'Integrated Rust Frontend toolchain',
                'Incorporated a project upscale plan',

                <Fragment key='code-rabbit-ai'>
                  Streamlined code review company-wide by utilizing{' '}
                  <ExternalLink href='http://coderabbit.ai/'>
                    CodeRabbitAI
                  </ExternalLink>
                </Fragment>,
                'Coordinated and mentored Frontend team',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_TURBO_STARS}>
                  Turbo Stars
                </ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_TURBO_STARS_SPORTSBOOK}>
                  Sportsbook
                </ExternalLink>
              }
              projectRole='Lead Frontend Engineer'
            />

            {/* Anadea */}
            {/* Jun 2022 - Oct 2023 */}
            <Project
              achievementList={[
                // 'Rocky',
                'Developed a social media platform from scratch',
                'Coordinated Frontend team dev flow',
                'Mentored Frontend team',
                'Refined product features with client',

                // 'Keystone',
                'Migrated a drilling platform from PHP to Next.js',
                'Created a component library using Vite and Storybook',
                'Implemented a cross-team Frontend training program',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_ANADAEA}>Anadea</ExternalLink>
              }
              projectName={
                <>
                  <ExternalLink href={links.LINK_ANADAEA_ROCKY}>
                    Rocky
                  </ExternalLink>
                  , Keystone (NDA)
                </>
              }
              projectRole='Lead Frontend Engineer'
            />

            {/* Corva */}
            {/* 2020 - 2021 */}
            {/* Sep 2020 - Feb 2021 */}
            <Project
              achievementList={[
                'Re-architected project Frontend',
                'Migrated codebase to TypeScript',
                'Improved performance stats by 40%',
                'Integrated rust-based tooling',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_CORVA}>Corva.ai</ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_CORVA_GEODRILLING}>
                  Geoscience Drilling
                </ExternalLink>
              }
              projectRole='Senior Frontend Engineer'
            />

            {/* Boosta */}
            {/* Feb 2021 - May 2021 */}
            <Project
              achievementList={[
                'Prototyped Frontend v2 architecture',
                'Implemented Frontend using Gatsby.js and Strapi CMS',
                'Coordinated legacy PHP backend migration',
                'Colocated frontend codebase into a monorepo',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_BOOSTA}>Boosta</ExternalLink>
              }
              projectName='Essay'
              projectRole='Senior Frontend Engineer'
            />

            {/* Temy */}
            {/* Dec 2019 − Nov 2020 */}
            <Project
              achievementList={[
                'Prototyped and developed Frontend v2 architecture rebranding',
                'Improved a product business model by polishing features with CTO',
                'Guided and mentored team’s development process',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_TEMY}>Temy</ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_TEMY_CCT}>
                  CCT Marketplace
                </ExternalLink>
              }
              projectRole='Senior Frontend Engineer'
            />

            {/* Buki */}
            {/* Nov 2019 − Apr 2020, part time */}
            <Project
              achievementList={[
                'Coordinated Frontend team dev flow',
                'Tutored and mentored team',
                //
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_BUKI}>Buki</ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_BUKI_MARKETPLACE}>
                  Tutor marketplace
                </ExternalLink>
              }
              projectRole='Frontend Team Lead, Tutor'
            />

            {/* Lectrum */}
            {/* Nov 2016 − Aug 2019 */}
            <Project
              achievementList={[
                'Developed LMS platform',
                'Managed team development process',
                'Created and maintained a Frontend branch educational program',
                'Tutored and mentored students',
              ]}
              comapnyLogoUrl={logoJpeg}
              courses={
                <>
                  <ExternalLink href={links.LINK_LECTRUM_COURSE_NEXT_JS}>
                    Next.js
                  </ExternalLink>
                  , React, JavaScript
                </>
              }
              employer={
                <ExternalLink href={links.LINK_LECTRUM}>
                  Lectrum.io
                </ExternalLink>
              }
              projectName='LMS platform'
              projectRole='Frontend Engineer, Tutor'
            />

            {/* WebPal */}
            {/* Dec 2016 − May 2017 */}
            <Project
              achievementList={[
                'Developed internal company product with React, Redux and Electron',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_WEB_PAL}>WebPal</ExternalLink>
              }
              projectName='NDA'
              projectRole='Junior Frontend Engineer'
            />

            {/* Ubisoft Lead */}
            {/* Jul 2016 − Dec 2016 */}
            <Project
              achievementList={[
                'Coordinated QC team workflow',
                'Organised milestone validation',
                'Created guidelines and test cases',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_UBISOFT}>Ubisoft</ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_UBISOFT_CONNECT}>
                  Ubisoft Connect
                </ExternalLink>
              }
              projectRole='Associate Lead QC'
            />

            {/* Ubisoft Dev Tester */}
            {/* Nov 2015 − Jul 2016 */}
            <Project
              achievementList={[
                'Conducted a video game console-to-PC port QA verification',
                'Created weekly QA report graphs',
              ]}
              comapnyLogoUrl={logoJpeg}
              employer={
                <ExternalLink href={links.LINK_UBISOFT}>Ubisoft</ExternalLink>
              }
              projectName={
                <ExternalLink href={links.LINK_WATCH_DOGS_2}>
                  Watch Dogs 2
                </ExternalLink>
              }
              projectRole='Junior Dev Tester'
            />
          </article>

          <article className='grid grid-cols-2 place-items-start gap-x-2 gap-y-1'>
            <SectionHeading
              accentColor='orange'
              className='col-span-full'
              text='tutoring'
            />

            {/* Lectrum */}
            {/* Nov 2020 − May 2021, part time */}
            <Project
              achievementList={[
                'Created Next.js and React course',
                'Tutored students with React, Next.js and JavaScript',
              ]}
              comapnyLogoUrl={logoJpeg}
              courses={
                <>
                  <ExternalLink href={links.LINK_LECTRUM_COURSE_NEXT_JS}>
                    Next.js
                  </ExternalLink>
                  , React
                </>
              }
              employer={
                <ExternalLink href={links.LINK_LECTRUM}>
                  Lectrum.io
                </ExternalLink>
              }
              projectRole='Course developer, Tutor'
            />

            {/* DAN.IT */}
            {/* Oct 2019 − Jan 2020, part time */}
            <Project
              achievementList={[
                'Developed courses program',
                'Tutored and mentored students',
              ]}
              comapnyLogoUrl={logoJpeg}
              courses={
                <>
                  <ExternalLink href={links.LINK_DAN_IT_FRONTEND_COURSE}>
                    Frontend
                  </ExternalLink>
                  , React
                </>
              }
              employer={
                <ExternalLink href={links.LINK_DAN_IT}>DAN.IT</ExternalLink>
              }
              projectRole='Tutor'
            />

            {/* QA Startup */}
            {/* Dec 2019, part time */}
            <Project
              achievementList={['Tutored and mentored students']}
              comapnyLogoUrl={logoJpeg}
              courses='Web Services'
              employer={
                <ExternalLink href={links.LINK_QA_STARTUP}>
                  QA Startup
                </ExternalLink>
              }
              projectRole='Tutor'
            />
          </article>
        </>
      )}
    </main>
  );
}
