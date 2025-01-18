export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <body>{props.children}</body>
        </html>
    );
};
