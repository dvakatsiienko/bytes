'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, cx } from 'cva';

export const LinkActive = (props: NavLinksProps) => {
    const pathname = usePathname();

    return (
        <Link
            className={linkActiveCn({
                intent: pathname === props.href ? 'active' : void 0,
                className: props.className,
            })}
            href={props.href}>
            {props.children}
        </Link>
    );
};

/* Styles */
const linkActiveCn = cva({
    base: cx(
        // TODO put into theme
        'grid h-full w-full items-center text-gray-500 dark:text-gray-400 ',
        'text-center font-semibold text-xs',
        'border-none',

        // 'border-surface-4 dark:border-surface-2',
    ),
    variants: {
        intent: {
            active: 'text-indigo-600 dark:text-link ',
        },
    },
});

/* Types */
interface NavLinksProps extends React.PropsWithChildren {
    href: string;
    className?: string;
}
