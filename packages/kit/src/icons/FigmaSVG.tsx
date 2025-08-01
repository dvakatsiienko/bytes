import type { TSvgProps } from './types';

export const FigmaSVG = (props: TSvgProps) => {
  const { size = 10, ...restProps } = props;

  return (
    <svg
      fill='none'
      height={size}
      viewBox='0 0 54 80'
      width={size}
      xmlns='http://www.w3.org/2000/svg'
      {...restProps}>
      <title>Figma</title>
      <g clipPath='url(#figma-clip0_912_3)'>
        <path
          d='M13.3333 80.0002C20.6933 80.0002 26.6667 74.0268 26.6667 66.6668V53.3335H13.3333C5.97333 53.3335 0 59.3068 0 66.6668C0 74.0268 5.97333 80.0002 13.3333 80.0002Z'
          fill='#0ACF83'
        />
        <path
          d='M0 39.9998C0 32.6398 5.97333 26.6665 13.3333 26.6665H26.6667V53.3332H13.3333C5.97333 53.3332 0 47.3598 0 39.9998Z'
          fill='#A259FF'
        />
        <path
          d='M0 13.3333C0 5.97333 5.97333 0 13.3333 0H26.6667V26.6667H13.3333C5.97333 26.6667 0 20.6933 0 13.3333Z'
          fill='#F24E1E'
        />
        <path
          d='M26.6667 0H40.0001C47.3601 0 53.3334 5.97333 53.3334 13.3333C53.3334 20.6933 47.3601 26.6667 40.0001 26.6667H26.6667V0Z'
          fill='#FF7262'
        />
        <path
          d='M53.3334 39.9998C53.3334 47.3598 47.3601 53.3332 40.0001 53.3332C32.6401 53.3332 26.6667 47.3598 26.6667 39.9998C26.6667 32.6398 32.6401 26.6665 40.0001 26.6665C47.3601 26.6665 53.3334 32.6398 53.3334 39.9998Z'
          fill='#1ABCFE'
        />
      </g>
      <defs>
        <clipPath id='figma-clip0_912_3'>
          <rect fill='white' height='80' width='53.3333' />
        </clipPath>
      </defs>
    </svg>
  );
};
