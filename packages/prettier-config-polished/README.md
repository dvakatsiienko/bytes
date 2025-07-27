# 💄 prettier-config-polished · [![npm version](https://badge.fury.io/js/prettier-config-polished.svg)](https://badge.fury.io/js/prettier-config-polished)

## 🔎 Overview

This package provides a fine-grained **Prettier** config as an extensible shared
config.

## 🏎️ Install

✅ Add config via **yarn** or package manager of your preference:

```sh
yarn add -D prettier prettier-config-polished
```

⚙️ Configure Prettier's **.prettierrc.js**:

```js
/** @type {import("prettier").Config} */
module.exports = { ...require('prettier-config-polished') };
```
