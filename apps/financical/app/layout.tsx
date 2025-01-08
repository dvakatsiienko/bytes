export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <body>{props.children}</body>
        </html>
    );
};
