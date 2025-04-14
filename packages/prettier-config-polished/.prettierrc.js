/** @type {import("prettier").Config} */
export default {
    tabWidth: 4,
    printWidth: 120,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: true,
    arrowParens: 'always',
    proseWrap: 'always',
    endOfLine: 'lf',
    overrides: [
        {
            files: '*.jsonc',
            options: {
                /*
                 * JSON with Comments (JSONC) supports comments but *must* adhere
                 * to strict JSON syntax, which forbids trailing commas.
                 * Override the default 'all' to 'none' for JSONC files.
                 */
                trailingComma: 'none',
            },
        },
    ],
};
