/* Core */
import { createGlobalStyle } from 'styled-components';

export const SPACING = 8;
export const COLORS = {
    primary:       '#220a82',
    secondary:     '#14cbc4',
    accent:        '#e535ab',
    background:    '#f7f8fa',
    grey:          '#d8d9e0',
    text:          '#343c5a',
    textSecondary: '#747790',
};

export const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
    }

        /* hide scrollbar but allow scrolling */
    body {
    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    overflow-y: scroll;
    }

    body::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
    }

    #root {
        display: flex;
        flex-direction: column;
        min-height: 100%;
    }

    html, body {
        height: 100%;
    }

    body {
        margin: 0;
        padding: 0;
        font-family: Source Sans Pro, system-ui, sans-serif;
        background-color: ${ COLORS.background };
        color: ${ COLORS.text };
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 0;
        font-weight: 600;
    }

    h1 {
        font-size: 48px;
        line-height: 1;
    }

    h2 {
        font-size: 40px;
    }

    h3 {
        font-size: 36px;
    }

    h5 {
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 4px;
    }
`;
