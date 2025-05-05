/* Core */
import { cva, cx } from 'cva';
import { Masonry, type RenderComponentProps } from 'masonic';

/* Components */
import { Tool } from './Tool';

/* Instruments */
import type { ITool, Stuff } from './toolConfig';

export const ToolSection = (props: ToolSectionProps) => {
    return (
        <section className={cx('mb-4x w-full p-1', 'bg-surface-5 dark:bg-surface-1', 'rounded-md', props.className)}>
            <h5 className='flex select-none items-center gap-1.5 pl-1 text-xs text-gray-500 dark:text-gray-400'>
                <span className='mt-0.5 inline-flex size-1 rounded-full bg-purple-500 dark:bg-purple-400' />
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
const toolListCn = cva({
    // base: cx('grid h-max gap-2', 'grid-cols-[repeat(auto-fit,minmax(clamp(40px,100%,75px),1fr))]'),
    // base: cx('grid h-max gap-2', 'grid-cols-[repeat(auto-fit,minmax(90px,1fr))]'),
    // base: cx('flex flex-wrap gap-1'),
    base: cx('grid gap-1 grid-cols-[repeat(auto-fill,minmax(clamp(40px,100%,50px),1fr))]'),
});

/* Types */
// interface ToolSectionProps extends RenderComponentProps<Stuff> {
interface ToolSectionProps {
    className?: string;
    title: string;
    toolList: ITool[];
}
