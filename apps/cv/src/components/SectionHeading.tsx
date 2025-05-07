/* Core */
import { cva, cx, type VariantProps } from 'cva';

export function SectionHeading(props: SectionHeadingProps) {
    const { color = 'sky', text, className, id } = props;

    return (
        <h3 id={id} className={cx('font-geist-mono col-span-2 flex select-none items-center gap-x-1.5', className)}>
            <b className={sectionHeadingCn({ color })} />
            {text}
        </h3>
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
    id?: string;
    text: string;
    className?: string;
}
