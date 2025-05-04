/* Core */
import { cva, cx } from 'cva';

/* Components */
import { Tool } from './Tool';

/* Instruments */
import type { ITool } from './toolConfig';

export const ToolSection = (props: ToolSectionProps) => {
    return (
        <section className='mb-4 grid'>
            <h5 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <span className='inline-flex h-1 w-2 rounded-full bg-purple-500 dark:bg-purple-400' />
                {props.title}
            </h5>

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
    base: cx('grid h-max gap-2', 'grid-cols-[repeat(auto-fit,minmax(90px,1fr))]'),
});

/* Types */
interface ToolSectionProps {
    title: string;
    toolList: ITool[];
}
