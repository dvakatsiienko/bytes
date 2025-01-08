import '@/app/ui/global.css';

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <body>{props.children}</body>
        </html>
    );
};
