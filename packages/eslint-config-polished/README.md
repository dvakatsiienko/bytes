# 💅🏼 eslint-config-polished

[![npm version](https://badge.fury.io/js/eslint-config-polished.svg)](https://badge.fury.io/js/eslint-config-polished)

## 🔎 Overview

This package provides a fine-grained **ESLint** config as an extensible shared config.

The config includes support for the following file extensions:

-   JavaScript: **.js**, **.mjs** and **.cjs**
-   TypeScript: **.ts**, **.mts** and **.cts**
-   React: **.tsx**, **.mtsx**, **.ctsx** and **.jsx**

The ESLint's
[overrides](https://eslint.org/docs/latest/use/configure/configuration-files#how-do-overrides-work)
pattern is used to achieve that.

**Consequently**, all you need to do to get linting support for **everything** mentioned above is to
simply extend **polished/typescript**.

## 🏎️ Install

This config avoids some **ESLint**'s and **@typescript-eslint**'s formatting rules.
[Read why](https://typescript-eslint.io/linting/troubleshooting/formatting/).

Because of this, the config is designed to use **Prettier** for formatting.

You can find the accompanying **Prettier** shareable config here:
[prettier-config-polished](https://github.com/dvakatsiienko/turborepo/tree/main/packages/prettier-config-polished).

✅ Add full-functioning config via **yarn** or package manager of your preference:

```sh
yarn add -D eslint eslint-config-polished prettier prettier-config-polished
```

⚙️ Configure ESLint's **.eslintrc.js**:

```js
/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: ['polished/typescript'],
};
```

⚙️ Configure Prettier's **.prettierrc.js**:

```js
/** @type {import("prettier").Config} */
module.exports = { ...require('prettier-config-polished') };
```

If you are not using **Prettier** (which you should), you can still use this config, just omit
everything related to **Prettier** in the **Install** and **configuration** steps.

## 🔬 Details

For **JavaScript** support, config relies on
[@babel/eslint-parser](https://github.com/babel/babel/tree/main/eslint/babel-eslint-parser). It is
installed automatically with this config.

For **TypeScript** support, config relies on
[@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser).
It is installed automatically with this config.

For **React** support, config relies on
[eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react). It is installed
automatically with this config.

## ✨ Advanced usage

For **VSCode** users I highly recommend [prettier-eslint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint) extension. I will catch up your **ESLint** configuration, so you will be able to execut in-editor formating that use **ESLint**'s rule set as schema.

In a result, almost all **ESLint** issues are autmatically resolved with formatting step.

This extension works with any valid **ESLint** configuration, including this one.

> 💡 If you want to format your code with CLI command, take a look at [prettier-eslint](https://github.com/prettier/prettier-eslint). It works great too.
