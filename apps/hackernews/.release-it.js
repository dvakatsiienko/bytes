module.exports = {
    git: {
        commitMessage: 'release v${version}',
    },
    npm: {
        publish: false,
    },
    github: {
        release: true,
        releaseName: 'v${version}',
    },
    hooks: {
        'after:bump': 'npx auto-changelog -p',
    },
};
