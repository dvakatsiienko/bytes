# tsconfig-dva

[![npm version](https://badge.fury.io/js/tsconfig-dva.svg)](https://badge.fury.io/js/tsconfig-dva)

### Installation

**yarn**

```sh
yarn add -D typescript tsconfig-dva
```

**npm**

```sh
npm install -D typescript tsconfig-dva
```

### Usage

Add the following to your project's **tsconfig.json**

```json
{
    "extends": "tsconfig-dva"
}
```

The suggested addition to `tsconfig.json` is `baseUrl` and `paths` configuration properties. This way you can use `import` statements to import project dependencies from the «top» entry point of the project (which is assumed to be `src`) is in the following way:

```tsx
import { Link } from '@/components/Link';

export const Navigation = () => {
    return (
        <nav>
            <Link to="/home">Home</Link>
            <Link to="/profile">Profile</Link>
        </nav>
    );
};
```

To allow such possibility add the following to your local `tsconfig.json`:

```json
{
    "compilerOptions": {
        /* Module resolution */
        "baseUrl": ".",
        "paths": { "@/*": ["src/*"] }
    }
}
```

The full configuration with `extended` **tsconfig-dva** would look like this:

```json
{
    "extends": "tsconfig-dva",
    "compilerOptions": {
        /* Module resolution */
        "baseUrl": ".",
        "paths": { "@/*": ["src/*"] }
    }
}
```
