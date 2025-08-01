import type { TSvgProps } from './types';

export const PrismaSVG = (props: TSvgProps) => {
  const { size = 10, ...restProps } = props;

  return (
    <svg
      className='fill-black dark:fill-white'
      height={size}
      preserveAspectRatio='xMidYMid'
      viewBox='0 0 256 310'
      width={size}
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}>
      <title>Prisma</title>
      <path d='M254.313 235.519L148 9.749A17.063 17.063 0 00133.473.037a16.87 16.87 0 00-15.533 8.052L2.633 194.848a17.465 17.465 0 00.193 18.747L59.2 300.896a18.13 18.13 0 0020.363 7.489l163.599-48.392a17.929 17.929 0 0011.26-9.722 17.542 17.542 0 00-.101-14.76l-.008.008zm-23.802 9.683l-138.823 41.05c-4.235 1.26-8.3-2.411-7.419-6.685l49.598-237.484c.927-4.443 7.063-5.147 9.003-1.035l91.814 194.973a6.63 6.63 0 01-4.18 9.18h.007z' />
    </svg>
  );
};
