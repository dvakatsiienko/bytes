import { clsx } from 'clsx';
import NextLink from 'next/link';

import { lusitana } from '@/theme/fonts';

export const Breadcrumbs = (props: BreadcrumbsProps) => {
  const breadcrumbListJSX = props.breadcrumbList.map((breadcrumb, index) => (
    <li
      aria-current={breadcrumb.active}
      className={clsx(breadcrumb.active ? 'text-gray-900' : 'text-gray-500')}
      key={breadcrumb.href}>
      <NextLink href={breadcrumb.href}>{breadcrumb.label}</NextLink>
      {index < props.breadcrumbList.length - 1 && (
        <span className='mx-3 inline-block'>/</span>
      )}
    </li>
  ));

  return (
    <nav aria-label='Breadcrumb' className='mb-6 block'>
      <ol className={clsx(lusitana.className, 'flex text-xl md:text-2xl')}>
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
  label: string;
  href: string;
  active?: boolean;
}
