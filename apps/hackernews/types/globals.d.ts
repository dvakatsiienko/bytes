/* Core */
import { z } from 'zod';

/* Instruments */
import { env } from '../src/env.mjs';
import { envConfig } from '../env-config.mjs';

declare global {
    declare const { __ENV__ } = envConfig;
    declare const { __DEV__ } = envConfig;
    declare const { __STAGE__ } = envConfig;
    declare const { __PROD__ } = envConfig;

    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof env> {}
    }
}
