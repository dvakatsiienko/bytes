/* Instruments */
import type { TSvgProps } from './types';

export const Vercel = (props: TSvgProps) => {
    const { size = 10, ...restProps } = props;

    return (
        <svg
            viewBox='0 0 256 222'
            width={size}
            height={size}
            xmlns='http://www.w3.org/2000/svg'
            preserveAspectRatio='xMidYMid'
            {...restProps}>
            <path className='dark:fill-white fill-black' d='m128 0 128 221.705H0z' />
        </svg>
    );
};
