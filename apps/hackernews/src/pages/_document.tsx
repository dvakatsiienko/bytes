/* Core */
import { Children } from 'react';
import Document, { Html, Head, Main, NextScript, type DocumentContext } from 'next/document';
import { ServerStyleSheet as SCServerStyleSheet } from 'styled-components';
import { CssBaseline as NextUiCssBaseline } from '@nextui-org/react';

/* Instruments */
import { nextFonts } from '@/theme';

export default class extends Document {
    public static async getInitialProps (ctx: DocumentContext) {
        const scserverStylesheet = new SCServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () => {
                return originalRenderPage({
                    enhanceApp: (App) => (props) => {
                        const scServerStleSheetResult = scserverStylesheet.collectStyles(<App { ...props } />);

                        return scServerStleSheetResult;
                    },
                });
            };

            const initialProps = await Document.getInitialProps(ctx);

            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {scserverStylesheet.getStyleElement()}
                        {Children.toArray([ initialProps.styles ])}
                    </>
                ),
            };
        } finally {
            scserverStylesheet.seal();
        }
    }

    public render () {
        return (
            <Html className = { nextFonts.robotoFlexVRFont.className } lang = 'en'>
                <Head>{NextUiCssBaseline.flush()}</Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
