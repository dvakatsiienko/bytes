'use client';

/* Core */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, cx } from 'cva';

export const NavLinks = () => {
    const pathname = usePathname();

    console.log('🚀 . NavLinks . pathname:', pathname);

    return (
        <>
            <Link className={breadcrumbLinkCn({ intent: pathname === '/' ? 'active' : void 0 })} href='/'>
                cv
            </Link>
            |
            <Link className={breadcrumbLinkCn({ intent: pathname === '/cover' ? 'active' : void 0 })} href='/cover'>
                cover
            </Link>
        </>
    );
};

/* Styles */
const breadcrumbLinkCn = cva({
    base: 'text-foreground dark:text-gray-400',
    variants: {
        intent: {
            active: 'text-link dark:text-link',
        },
    },
});
