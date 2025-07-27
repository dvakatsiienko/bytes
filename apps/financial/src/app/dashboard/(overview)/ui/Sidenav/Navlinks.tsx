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
          'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 font-medium text-sm hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
          { 'bg-sky-100 text-blue-600': pathname === link.href },
        )}
        href={link.href}
        key={link.name}>
        <LinkIcon className='w-6' />
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
