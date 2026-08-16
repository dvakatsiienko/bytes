'use client';

import { PowerIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { NavLinks } from './Navlinks';
import { display } from '@/theme/fonts';
import { AcmeLogo } from '@/ui/AcmeLogo';

export const Sidenav = () => {
  return (
    <nav className='perforation flex h-full flex-col bg-bar/40 pl-4'>
      <Link
        className='flex h-20 items-end border-rule border-b px-4 pb-4 md:h-32'
        href='/'>
        <span className={`${display.className} text-ink`}>
          <span className='w-32 md:w-40'>
            <AcmeLogo />
          </span>
        </span>
      </Link>

      <div className='flex grow flex-row justify-between gap-1 p-3 md:flex-col md:gap-0.5'>
        <NavLinks />

        <div className='hidden grow md:block' />

        <button
          className='flex h-11 w-full grow items-center justify-center gap-3 px-3 text-ink-soft text-sm transition-colors hover:bg-bar hover:text-ink md:flex-none md:justify-start'
          onClick={() => signOut()}
          type='button'>
          <PowerIcon className='w-5' />
          <span className='hidden md:block'>Sign out</span>
        </button>
      </div>
    </nav>
  );
};
