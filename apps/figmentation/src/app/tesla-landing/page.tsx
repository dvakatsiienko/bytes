/** biome-ignore-all lint/correctness/noUnusedImports: wip */

import { cva } from 'cva';
import { Button } from '@ui/kit/components/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@ui/kit/components/drawer';
import { cn } from '@ui/kit/lib/utils';
import type { Metadata } from 'next';
import Image from 'next/image';
import NextImage from 'next/image';
import NextLink from 'next/link';

import landingModelYMobile from '/public/tesla-landing/landing-model-y-mobile.avif';
import { GlobeSvg, LogoTeslaSvg, QuestionmarkSvg, UserSvg } from './svg';

const buttonTesla = cva({
  base: cn('h-10 min-w-[160px] max-w-[200px] flex-1 rounded-sm', ''),
});

const TeslaLandingPage = () => {
  return (
    <main className='sm:text-lg'>
      <Header />

      <section className='hero relative -mt-14 max-h-[500px] min-h-[600px] pt-20'>
        <NextImage
          alt='Tesla Model Y'
          className='z-0 max-h-[500px] w-full object-cover'
          fill
          placeholder='blur'
          sizes='(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw'
          src={landingModelYMobile}
        />

        <section className='meta isolate z-10 mx-auto grid w-full max-w-md content-center gap-4 px-6'>
          <section className='grid place-items-center gap-2 text-white'>
            <h1 className='font-medium text-5xl'>Model Y</h1>
            <p className='text-lg'>1.99% APR Ending June 16</p>
          </section>

          <section className='mx-auto flex w-full max-w-[408px] flex-col items-center gap-2'>
            <Button className={buttonTesla()}>Order Now</Button>
            <Button className={buttonTesla()} variant='outline'>
              View Inventory
            </Button>
          </section>
        </section>
      </section>

      {/* <div className='bg-tesla-accent-500 size-40'></div> */}
    </main>
  );
};

const Header = () => {
  const _navLinkListJSX = headerNavLinksList.map((link) => (
    <Button asChild key={link.label} variant='link'>
      <NextLink href={link.href}>{link.label}</NextLink>
    </Button>
  ));

  return (
    <header className={headerVariants()}>
      <LogoTeslaSvg className='fill-white tesla-tablet:fill-black' />
      {/* <nav className='hidden xl:flex'>{navLinkListJSX}</nav> */}

      {/* <div className='hidden items-center gap-4 xl:flex'>
                <GlobeSvg />
                <QuestionmarkSvg />
                <UserSvg />
            </div> */}

      <Drawer direction='top'>
        <DrawerTrigger asChild>
          <Button className='xl:hidden' variant='link'>
            Menu
          </Button>
        </DrawerTrigger>

        <DrawerContent className='after:unset! top-14!'>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </header>
  );
};

/* Styles */
const headerVariants = cva({
  base: cn(
    'sticky top-0 isolate z-10 flex h-14 items-center justify-between px-2',
    'bg-transparent tesla-tablet:bg-white',
    // test
  ),
});

export const metadata: Metadata = {
  title: 'Tesla Landing',
};

/* Helpers */
const headerNavLinksList = [
  { href: '#', label: 'Vehicles' },
  { href: '#', label: 'Energy' },
  { href: '#', label: 'Charging' },
  { href: '#', label: 'Discover' },
  { href: '#', label: 'Shop' },
];

export default TeslaLandingPage;
