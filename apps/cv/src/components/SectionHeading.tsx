/* Core */
import { cva, cx, type VariantProps } from 'cva';

export function SectionHeading(props: SectionHeadingProps) {
    const { color = 'sky', text, className } = props;

    return (
        <h4 className={cx('col-span-2 flex items-center gap-x-1.5 select-none', className)}>
            <b className={sectionHeadingCn({ color })} />
            {text}
        </h4>
    );
}

/* Styles */
const sectionHeadingCn = cva({
    base: 'block h-1.5 w-3.5 rounded-full bg-link',
    variants: {
        color: {
            sky: 'bg-sky-600',
            purple: 'bg-purple-600',
        },
    },
});

/* Types */
type SectionHeadingCn = VariantProps<typeof sectionHeadingCn>;

interface SectionHeadingProps extends SectionHeadingCn {
    text: string;
    className?: string;
}
