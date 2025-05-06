/* Core */
import { cva, cx, type VariantProps } from 'cva';
import { Masonry, type RenderComponentProps } from 'masonic';

/* Components */
import { Tool } from './Tool';

/* Instruments */
import type { ITool, Stuff } from './toolConfig';

export const ToolSection = (props: ToolSectionProps) => {
    return (
        <section className={cx('w-full p-2 px-1.5', 'bg-surface-5 dark:bg-surface-1', 'rounded-md', props.className)}>
            <h5 className={toolSectionHeadingCn()}>
                <span className={headingAccentCn({ color: props.color })} />
                {props.title}
            </h5>
            <hr className='dark:border-gray-750/50 mx-auto mb-1 mt-0 w-[calc(100%-0.5rem)] border-gray-500/10' />

            <section className={toolListCn()}>
                {props.toolList.map((tool) => (
                    <Tool key={tool.name} name={tool.name} Icon={tool.icon} />
                ))}
            </section>
        </section>
    );
};

/* Styles */
const headingAccentCn = cva({
    base: 'mt-0.5 inline-flex size-1 rounded-full',
    variants: {
        color: {
            orange: 'bg-orange-500 dark:bg-orange-400',
            purple: 'bg-purple-500 dark:bg-purple-400',
            blue: 'bg-blue-500 dark:bg-blue-400',
            sky: 'bg-sky-500 dark:bg-sky-400',
            emerald: 'bg-emerald-500 dark:bg-emerald-400',
            indigo: 'bg-indigo-500 dark:bg-indigo-400',
            fuchsia: 'bg-fuchsia-500 dark:bg-fuchsia-400',
            rose: 'bg-rose-500 dark:bg-rose-400',
            lime: 'bg-lime-500 dark:bg-lime-400',
            cyan: 'bg-cyan-500 dark:bg-cyan-400',
            violet: 'bg-violet-500 dark:bg-violet-400',
        },
    },
    defaultVariants: { color: 'purple' },
});
const toolSectionHeadingCn = cva({
    base: 'flex select-none items-center gap-1.5 pl-1 text-[14px] mb-0.5 leading-none text-gray-500 dark:text-gray-400',
});

const toolListCn = cva({
    // base: cx('grid h-max gap-2', 'grid-cols-[repeat(auto-fit,minmax(clamp(40px,100%,75px),1fr))]'),
    // base: cx('grid h-max gap-2', 'grid-cols-[repeat(auto-fit,minmax(90px,1fr))]'),
    // base: cx('flex flex-wrap gap-1'),
    base: cx('grid gap-1 grid-cols-[repeat(auto-fit,minmax(clamp(50px,100%,60px),1fr))]'),
});

/* Types */
// interface ToolSectionProps extends RenderComponentProps<Stuff> {
interface ToolSectionProps extends ToolSectionCnProps {
    className?: string;
    title: string;
    toolList: ITool[];
}

type ToolSectionCnProps = VariantProps<typeof headingAccentCn>;
