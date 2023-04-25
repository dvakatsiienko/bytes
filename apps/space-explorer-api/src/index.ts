/* Core */
import { join } from 'path';
import { ApolloServer } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { z } from 'zod';
import dotenv from 'dotenv';
import type { DocumentNode } from 'graphql';
import chalk from 'chalk';

// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';

/* Instruments */
import { resolvers } from './resolvers';
import { SpaceXAPI, UserAPI } from './datasources';
import { getDirname } from '@/utils';

dotenv.config({ path: '.env.development.local' });

const schema = loadSchemaSync(join(getDirname(import.meta.url), './graphql/schema.graphql'), {
    loaders: [ new GraphQLFileLoader() ],
}) as unknown as DocumentNode;

const apolloServer = new ApolloServer({
    resolvers,
    typeDefs: schema,
    context:  async expressCtx => {
        const { req } = expressCtx;

        const auth = req.headers?.authorization ?? '';
        const userEmail = Buffer.from(auth, 'base64').toString('ascii');

        return { userEmail: z.string().email().safeParse(userEmail).success ? userEmail : null };
    },
    dataSources: () => ({
        spaceXAPI: new SpaceXAPI(),
        userAPI:   new UserAPI(),
    }),
});

// const { url } = await startStandaloneServer(apolloServer, {
//     // context: async ({ req }) => ({ token: req.headers.token }),
//     context: async expressCtx => {
//         const { req } = expressCtx;

//         const auth = req.headers?.authorization ?? '';
//         const userEmail = Buffer.from(auth, 'base64').toString('ascii');

//         return { userEmail: z.string().email().safeParse(userEmail).success ? userEmail : null };
//     },
//     listen: { port: 4000 },
// });

/* eslint-disable-next-line prefer-destructuring */
const PORT = process.env.PORT;

apolloServer.listen({ port: PORT }).then(data => {
    const isProd = process.env.NODE_ENV === 'production';
    const protocol = isProd ? 'https' : 'http';
    const HOST = isProd ? 'space-explorer-api-production.up.railway.app' : 'localhost';

    console.log(
        chalk.cyanBright(
            `🚀 Server ready at ${chalk.blueBright(
                `${protocol}://${HOST}:${data.port}${apolloServer.graphqlPath}`,
            )}`,
        ),
    );
});
