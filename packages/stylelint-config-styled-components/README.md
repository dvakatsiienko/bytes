# stylelint-config-styled-components-dva

[![npm version](https://badge.fury.io/js/stylelint-config-styled-components-dva.svg)](https://badge.fury.io/js/stylelint-config-styled-components-dva)

This package provides Dima Vakatsiienko's (dva) **stylelint** config as an extensible shared config.

The config is an extension of **[stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)** and **[stylelint-config-recess-order](https://github.com/stormwarning/stylelint-config-recess-order)**.

**The following stylelint plugins are included**:

-   [stylelint-order](https://github.com/hudochenkov/stylelint-order)
-   [stylelint-selector-no-empty](https://github.com/ssivanatarajan/stylelint-selector-no-empty)
-   [stylelint-declaration-block-no-ignored-properties](https://github.com/kristerkari/stylelint-declaration-block-no-ignored-properties)
-   [stylelint-use-nesting](https://github.com/csstools/stylelint-use-nesting)

Also, the config is dependent on the [stylelint-processor-styled-components](https://github.com/styled-components/stylelint-processor-styled-components).

> All the required dependencies are included in the installation script below.

### Install

Install all the required packages using the following script:

**yarn**

```sh
yarn add -D stylelint stylelint-config-styled-components-dva stylelint-processor-styled-components stylelint-config-standard stylelint-config-recess-order stylelint-order stylelint-selector-no-empty stylelint-declaration-block-no-ignored-properties stylelint-use-nesting
```

**npm**

```sh
npm install -D stylelint stylelint-config-styled-components-dva stylelint-processor-styled-components stylelint-config-standard stylelint-config-recess-order stylelint-order stylelint-selector-no-empty stylelint-declaration-block-no-ignored-properties stylelint-use-nesting
```

### Usage

Add the following to your `stylelint.config.js`:

```js
module.exports = {
    extends: ['stylelint-config-styled-components-dva']
};
```
