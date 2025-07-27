import type { TSvgProps } from './types';

export const ChadcnSVG = (props: TSvgProps) => {
    const { size = 10, ...restProps } = props;

    return (
        <svg
            height={size}
            viewBox='0 0 256 256'
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...restProps}>
            <title>shadcn/ui</title>
            <rect fill='none' height='256' width='256' />
            <line
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='32'
                x1='208'
                x2='128'
                y1='128'
                y2='208'
            />
            <line
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='32'
                x1='192'
                x2='40'
                y1='40'
                y2='192'
            />
        </svg>
    );
};
