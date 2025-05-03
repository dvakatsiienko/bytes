'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BrowserLink = () => {
    const pathname = usePathname();

    const href = pathname === '/' ? '/cover' : '/';
    const linkText = pathNameMap[pathname as keyof typeof pathNameMap];

    return (
        <Link className='text-black dark:text-white' href={href}>
            {linkText}
        </Link>
    );
};

/* Helpers */
const pathNameMap = {
    '/': 'my.cv',
    '/cover': 'my.cover',
} as const;
