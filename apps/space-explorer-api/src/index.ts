/* Core */
import { join } from 'node:path';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { z } from 'zod';
import dotenv from 'dotenv';
import chalk from 'chalk';
import type { DocumentNode } from 'graphql';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

/* Instruments */
import { prismaClient } from '@/lib';
import { getDirname } from '@/utils';
import { resolvers } from './resolvers';
import { SpaceXAPI, UserAPI } from './datasources';

dotenv.config({ path: '.env.development.local' });

// TODO resolve ESLint conflict that leads to too long lines
const typeDefs = loadSchemaSync(join(getDirname(import.meta.url), './graphql/schema.graphql'), { loaders: [ new GraphQLFileLoader() ]}) as unknown as DocumentNode;

const apolloServer = new ApolloServer({ resolvers, typeDefs });

const { url } = await startStandaloneServer(apolloServer, {
    context: async (expressCtx) => {
        const { req } = expressCtx;

        const auth = req.headers?.authorization ?? '';

        const decodedUserEmail = Buffer.from(auth, 'base64').toString('ascii');
        let userEmail = z.string().email().safeParse(decodedUserEmail).success
            ? decodedUserEmail
            : null;

        let isUserExists = false;

        if (userEmail) {
            const user = await prismaClient.user.findUnique({ where: { email: userEmail }});
            isUserExists = Boolean(user);
        }

        if (!isUserExists) userEmail = null;

        return {
            userEmail,
            dataSources: {
                spaceXAPI: new SpaceXAPI(),
                userAPI:   new UserAPI(userEmail),
            },
        };
    },
    listen: { port: Number(process.env.PORT) ?? 4000 },
});

console.log(chalk.cyanBright(`🚀 Server ready at ${ chalk.blueBright(url) }`));
