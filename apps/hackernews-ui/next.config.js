module.exports = {
    async redirects() {
        return [
            {
                source:      '/user',
                destination: '/new/1',
                permanent:   true,
            },
            {
                source:      '/new',
                destination: '/new/1',
                permanent:   true,
            },
        ];
    },
};
