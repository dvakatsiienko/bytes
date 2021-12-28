/* Core */
import Document, { DocumentContext } from 'next/document';
import { ServerStyleSheet as StyledServerStyleSheet } from 'styled-components';
import { CssBaseline as GeistCssBaseline } from '@geist-ui/react';

export default class extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const styledComponentsStylesheet = new StyledServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () => {
                return originalRenderPage({
                    enhanceApp: (App) => (props) => {
                        const styledSheetResult = styledComponentsStylesheet.collectStyles(
                            <App { ...props } />,
                        );

                        return styledSheetResult;
                    },
                });
            };

            const initialProps = await Document.getInitialProps(ctx);

            const geistStyles = GeistCssBaseline.flush();

            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {styledComponentsStylesheet.getStyleElement()}
                        {geistStyles}
                    </>
                ),
            };
        } finally {
            styledComponentsStylesheet.seal();
        }
    }
}
