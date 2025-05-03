export const Entry = (props: EntryProps) => {
    return (
        <div className = 'entry flex'>
            <span className = 'name min-w-46 uppercase text-gray-500'>{props.name}</span>
            <span className = 'value'>{props.content}</span>
        </div>
    );
};

/* Core */
interface EntryProps {
    name:    string,
    content: string | React.ReactNode,
}
