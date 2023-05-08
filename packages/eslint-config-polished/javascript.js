/* eslint-env: Node */

/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    extends:        [ './lib/javascript', './lib/react' ],
    ignorePatterns: [
        'node_modules', // →↓
        '.next', // →→→→→→→→↓
        'dist', // →→→→→→→→→→ ignore specificed folders
        'build', // →→→→→→→→↑
        'graphql', // →→→→→→↑
        '!.*.*', // ? allow dotfiles to be linted
    ],
};
