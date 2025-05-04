/* Core */
import { cva, cx } from 'cva';
import { ITool } from './toolConfig';

export const Tool = (props: ToolProps) => {
    const Icon = props.Icon;

    return (
        <div className={toolCn()}>
            {typeof Icon === 'function' && <Icon size={18} />}
            <span className='text-[11px] text-gray-600 dark:text-gray-300'>{props.name}</span>
        </div>
    );
};

/* Styles */
const toolCn = cva({
    base: cx(
        'grid grid-flow-col rounded-lg p-1 gap-2',
        'bg-surface-5 dark:bg-surface-1 hover:bg-surface-4 dark:hover:bg-surface-2',
        'place-content-center place-items-center',
        'cursor-pointer ',
    ),
});

/* Types */
interface ToolProps extends React.PropsWithChildren {
    name: ITool['name'];
    Icon?: ITool['icon'];
}
