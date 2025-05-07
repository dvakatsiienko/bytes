/* Core */
import { cva, cx } from 'cva';
import { ITool } from './toolConfig';

export const Tool = (props: ToolProps) => {
    const Icon = props.Icon;

    return (
        <div className={toolCn()}>
            {typeof Icon === 'function' && <Icon size={18} />}
            <span className='text-nowrap text-center text-[12px] leading-none text-gray-600 dark:text-gray-400'>
                {props.name}
            </span>
        </div>
    );
};

/* Styles */
const toolCn = cva({
    base: cx(
        'grid rounded-lg px-1.5 py-2 gap-y-1.5',
        'bg-surface-7 dark:bg-surface-4 hover:bg-surface-4 dark:hover:bg-surface-3',
        'place-content-center place-items-center',
        'cursor-pointer select-none',
    ),
});

/* Types */
interface ToolProps extends React.PropsWithChildren {
    name: ITool['name'];
    Icon?: ITool['icon'];
}
