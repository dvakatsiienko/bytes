/* Core */
import { cva, cx } from 'cva';

export const Tool = (props: ToolProps) => {
    return (
        <div className={toolCn()}>
            <span className='text-xs text-gray-500 dark:text-gray-400'>{props.name}</span>
        </div>
    );
};

/* Styles */
const toolCn = cva({
    base: cx(
        'grid rounded-lg p-1',
        'bg-surface-5 dark:bg-surface-1 hover:bg-surface-4 dark:hover:bg-surface-2',
        'place-content-center place-items-center',
        'cursor-pointer ',
    ),
});

/* Types */
interface ToolProps extends React.PropsWithChildren {
    name: string;
}
