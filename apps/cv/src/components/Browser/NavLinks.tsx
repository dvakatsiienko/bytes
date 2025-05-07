'use client';

/* Core */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, cx } from 'cva';

export const NavLinks = () => {
    const pathname = usePathname();

    // return nu
    return (
        <nav
            className={cx(
                'grid h-5 grid-cols-[1fr_1fr] place-content-center place-items-center',
                'bg-surface-5 dark:bg-surface-2 rounded-sm',
                '  max-w-full',
                'select-none',
            )}>
            <Link
                className={breadcrumbLinkCn({
                    intent: pathname === '/' ? 'active' : void 0,
                    className: 'rounded-l-sm',
                })}
                href='/'>
                cv
            </Link>

            <Link
                className={breadcrumbLinkCn({
                    intent: pathname === '/cover' ? 'active' : void 0,
                    className: 'rounded-r-sm',
                })}
                href='/cover'>
                cover
            </Link>
        </nav>
    );
};

/* Styles */
const breadcrumbLinkCn = cva({
    base: cx(
        'text-gray-500 w-full grid items-center h-full dark:text-gray-400 ',
        'text-center font-semibold text-xs',
        'hover:bg-surface-2 dark:hover:bg-surface-4',
        'border-surface-4 dark:border-surface-2',
    ),
    variants: {
        intent: {
            active: 'text-indigo-600 dark:text-link bg-surface-2 dark:bg-surface-4 ',
        },
    },
});
