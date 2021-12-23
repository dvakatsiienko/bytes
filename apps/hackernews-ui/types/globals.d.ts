// eslint-disable-next-line @typescript-eslint/no-var-requires
const { envConfig } = require('../env-config.js');

declare const __ENV: string = envConfig.__ENV__;
declare const __DEV__: boolean = envConfig.__DEV__;
declare const __STAGE__: boolean = envConfig.__STAGE__;
declare const __PROD__: boolean = envConfig.__PROD__;
declare const __TEST__: boolean = envConfig.__TEST__;
