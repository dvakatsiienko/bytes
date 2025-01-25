export const Entry = (props: EntryProps) => {
    return (
        <div className = 'entry'>
            <span className = 'name'>{props.name}</span>
            <span className = 'value'>{props.content}</span>
        </div>
    );
};

/* Core */
interface EntryProps {
    name:    string,
    content: string | React.ReactNode,
}
