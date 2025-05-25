/* Core */
import { cx } from 'cva';

export const BriefEntry = (props: BriefEntryProps) => {
    return (
        <>
            {/* TODO adjust text-gray for light/dark */}
            <span className={cx('name max-w-46 w-full select-none lowercase text-gray-500', props.className)}>
                {props.name}
            </span>
            <span className={cx('value', props.className)}>{props.content}</span>
        </>
    );
};

/* Core */
interface BriefEntryProps {
    className?: string;
    name: string;
    content: string | React.ReactNode;
}
