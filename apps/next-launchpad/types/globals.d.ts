// eslint-disable-next-line @typescript-eslint/no-var-requires
const { envConfig } = require('../env-config.js');

declare const { __ENV__ }: { __ENV__: string } = envConfig;
declare const { __DEV__ }: { __DEV__: boolean } = envConfig;
declare const { __STAGE__ }: { __STAGE__: boolean } = envConfig;
declare const { __PROD__ }: { __PROD__: boolean } = envConfig;
declare const { __TEST__ }: { __TEST__: boolean } = envConfig;
