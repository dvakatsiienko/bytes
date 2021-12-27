/* eslint-env node */

module.exports = {
    plugins: {
        'postcss-preset-env': {
            stage:    0,
            features: {
                'custom-media-queries': {
                    importFrom: [
                        {
                            customMedia: {
                                '--XXS': '(width <= 414px)',
                                '--XS':  '(width >= 668px) and (width <= 768px)',
                                '--S':   '(width >= 769px) and (width <= 1024px)',
                                '--M':   '(width >= 1025px) and (width <= 1366px)',
                                '--L':   '(width >= 1367px) and (width <= 1680px)',
                                '--XL':  '(width >= 1681px) and (width <= 1920px)',
                                '--XXL': '(width >= 1921px)',
                            },
                        },
                    ],
                },
            },
        },
    },
};
