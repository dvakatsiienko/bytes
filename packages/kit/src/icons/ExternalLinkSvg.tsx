import type { SVGProps } from 'react';

import { cn } from '../lib/utils';

export const ExternalLinkSvg = (props: SVGProps<SVGSVGElement>) => {
  const { className, ...restProps } = props;

  return (
    <svg
      className={cn('size-4', className)}
      fill='#000000'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}>
      <title>External Link</title>
      <path
        d='M19,14 L19,19 C19,20.1045695 18.1045695,21 17,21 L5,21 C3.8954305,21 3,20.1045695 3,19 L3,7 C3,5.8954305 3.8954305,5 5,5 L10,5 L10,7 L5,7 L5,19 L17,19 L17,14 L19,14 Z M18.9971001,6.41421356 L11.7042068,13.7071068 L10.2899933,12.2928932 L17.5828865,5 L12.9971001,5 L12.9971001,3 L20.9971001,3 L20.9971001,11 L18.9971001,11 L18.9971001,6.41421356 Z'
        fillRule='evenodd'
      />
    </svg>
  );
};
