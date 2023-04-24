export const CurveSvg = (props: CurveSvgProps) => {
    return (
        <svg
            className = { props.className }
            preserveAspectRatio = 'none'
            viewBox = '0 0 600 92'
            xmlns = 'http://www.w3.org/2000/svg'
        >
            <path d = 'M600,0 L600,50.0069831 C504.031934,78.0023277 406.564775,92 307.59852,92 C208.632266,92 106.099426,78.0023277 0,50.0069831 L0,0 L600,0 Z' />
        </svg>
    );
};

/* Types */
type CurveSvgProps = React.HTMLAttributes<HTMLOrSVGElement>;
