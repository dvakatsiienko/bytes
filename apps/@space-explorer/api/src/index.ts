/* Core */
import { join } from 'path';
import { ApolloServer } from 'apollo-server';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { z } from 'zod';
import dotenv from 'dotenv';
import type { DocumentNode } from 'graphql';
import chalk from 'chalk';

/* Instruments */
import { resolvers } from './resolvers';
import { SpaceXAPI, UserAPI } from './datasources';

dotenv.config({ path: '.env.development.local' });

const schema = loadSchemaSync(join(__dirname, './graphql/schema.graphql'), {
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
