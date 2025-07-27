import type { TSvgProps } from './types';

export const VercelSVG = (props: TSvgProps) => {
    const { size = 10, ...restProps } = props;

    return (
        <svg
            height={size}
            preserveAspectRatio='xMidYMid'
            viewBox='0 0 256 222'
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...restProps}>
            <title>Vercel</title>
            <path
                className='fill-black dark:fill-white'
                d='m128 0 128 221.705H0z'
            />
        </svg>
    );
};
