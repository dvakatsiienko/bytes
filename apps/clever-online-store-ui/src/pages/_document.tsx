/* Core */
import Document, {
    Html,
    Head,
    NextScript,
    Main,
    DocumentContext
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class _Document extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () => {
                return originalRenderPage({
                    enhanceApp: App => {
                        return props => {
                            return sheet.collectStyles(<App { ...props } />);
                        };
                    },
                });
            };

            const initialProps = await Document.getInitialProps(ctx);

            return {
                ...initialProps,
                styles: (
                    <>
                        {sheet.getStyleElement()}
                        {initialProps.styles}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        const fonts = [ '400', '500', '700' ];

        const preloadFontLinksJSX = fonts.map((font, index) => {
            return (
                <link
                    as = 'font'
                    crossOrigin = 'anonymous'
                    href = { `/fonts/roboto/roboto-${font}.woff2` }
                    key = { index }
                    rel = 'preload'
                    type = 'font/woff2'
                />
            );
        });

        return (
            <Html lang = 'en-US'>
                <Head>
                    <link href = '/favicon.png' rel = 'shortcut icon' />

                    {preloadFontLinksJSX}

                    {this.props.styles}
                </Head>

                <body>
                    <Main />

                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default _Document;
