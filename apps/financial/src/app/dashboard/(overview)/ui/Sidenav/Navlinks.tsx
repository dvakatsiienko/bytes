'use client';

import cx from 'clsx';
import {
  DocumentDuplicateIcon,
  HomeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLinks = () => {
  const pathname = usePathname();

  return links.map((link) => {
    const LinkIcon = link.icon;

    return (
      <Link
        className={cx(
          'flex h-11 grow items-center justify-center gap-3 border-l-2 px-3 text-sm transition-colors md:flex-none md:justify-start',
          pathname === link.href
            ? 'border-l-seal bg-bar font-medium text-ink'
            : 'border-l-transparent text-ink-soft hover:bg-bar/60 hover:text-ink',
        )}
        href={link.href}
        key={link.name}>
        <LinkIcon className='w-5' />
        <p className='hidden md:block'>{link.name}</p>
      </Link>
    );
  });
};

/* Helpers */
const links = [
  { href: '/dashboard', icon: HomeIcon, name: 'Home' },
  {
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
    name: 'Invoices',
  },
  { href: '/dashboard/customers', icon: UserGroupIcon, name: 'Customers' },
];
