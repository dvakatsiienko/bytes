/* Instruments */
import type { TSvgProps } from './types';

export const GraphQL = (props: TSvgProps) => {
    const { size = 10, ...rest } = props;

    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 100 100'
            width={size}
            height={size}
            fill='#e10098'
            style={{ fill: 'color(display-p3 0.8824 0 0.5961)' }}
            {...rest}>
            <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M50 6.90308L87.323 28.4515V71.5484L50 93.0968L12.677 71.5484V28.4515L50 6.90308ZM16.8647 30.8693V62.5251L44.2795 15.0414L16.8647 30.8693ZM50 13.5086L18.3975 68.2457H81.6025L50 13.5086ZM77.4148 72.4334H22.5852L50 88.2613L77.4148 72.4334ZM83.1353 62.5251L55.7205 15.0414L83.1353 30.8693V62.5251Z'
            />
        </svg>
    );
};
