
import { cx } from 'cva';

export const BriefEntry = (props: BriefEntryProps) => {
    return (
        <>
            {/* TODO adjust text-gray for light/dark */}
            <span className={cx('name w-full max-w-46 select-none text-gray-500 lowercase', props.className)}>
                {props.name}
            </span>
            <span className={cx('value', props.className)}>{props.content}</span>
        </>
    );
};


interface BriefEntryProps {
    className?: string;
    name: string;
    content: string | React.ReactNode;
}
