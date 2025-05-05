export const Entry = (props: EntryProps) => {
    return (
        <>
            {/* TODO adjust text-gray for light/dark */}
            <span className='name w-full max-w-46 lowercase text-gray-500 select-none'>{props.name}</span>
            <span className='value'>{props.content}</span>
        </>
    );
};

/* Core */
interface EntryProps {
    name: string;
    content: string | React.ReactNode;
}
