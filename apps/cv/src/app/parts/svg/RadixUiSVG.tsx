/* Instruments */
import type { TSvgProps } from './types';

export const RadixUiSVG = (props: TSvgProps) => {
    const { size = 10, ...restProps } = props;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            style={{ marginRight: '3px', width: size, height: size }}
            viewBox='4 0 17 25'
            {...restProps}>
            <path
                className='fill-black dark:fill-white'
                d='M12 25a8 8 0 1 1 0-16v16zM12 0H4v8h8V0zM17 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
            />
        </svg>
    );
};
