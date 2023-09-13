/* Core */
import { Children } from 'react';
import Document, { Html, Head, Main, NextScript, type DocumentContext } from 'next/document';
import { ServerStyleSheet as SCServerStyleSheet } from 'styled-components';

/* Instruments */
import { nextFonts } from '@/theme';

export default class MyDocument extends Document {
    public static async getInitialProps (ctx: DocumentContext) {
        const scServerStylesheet = new SCServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () => {
                return originalRenderPage({
                    enhanceApp: (App) => (props) => {
                        const scServerStyleSheetResult = scServerStylesheet.collectStyles(<App { ...props } />);

                        return scServerStyleSheetResult;
                    },
                });
            };

            const initialProps = await Document.getInitialProps(ctx);

            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {scServerStylesheet.getStyleElement()}
                        {Children.toArray([ initialProps.styles ])}
                    </>
                ),
            };
        } finally {
            scServerStylesheet.seal();
        }
    }

    public render () {
        return (
            <Html className = { nextFonts.robotoFlexVRFont.className } lang = 'en'>
                <Head>
                    <meta charSet = 'utf-8' />
                    <link
                        href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
                        rel = 'stylesheet'
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
