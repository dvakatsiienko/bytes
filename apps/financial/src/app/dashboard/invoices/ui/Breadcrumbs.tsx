import { clsx } from 'clsx';
import NextLink from 'next/link';

import { display } from '@/theme/fonts';

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const breadcrumbListJSX = props.breadcrumbList.map((breadcrumb, index) => (
    <li
      aria-current={breadcrumb.active}
      className={clsx(breadcrumb.active ? 'text-ink' : 'text-ink-soft')}
      key={breadcrumb.href}>
      <NextLink href={breadcrumb.href}>{breadcrumb.label}</NextLink>
      {index < props.breadcrumbList.length - 1 && (
        <span className='mx-3 inline-block'>/</span>
      )}
    </li>
  ));

  return (
    <nav
      aria-label='Breadcrumb'
      className='mb-8 block border-rule border-b pb-4'>
      <ol
        className={clsx(
          display.className,
          'flex text-2xl tracking-tight md:text-3xl',
        )}>
        {breadcrumbListJSX}
      </ol>
    </nav>
  );
};

/* Types */
interface BreadcrumbsProps {
  breadcrumbList: Breadcrumb[];
}

interface Breadcrumb {
  active?: boolean;
  href: string;
  label: string;
}
