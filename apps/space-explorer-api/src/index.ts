import { join } from 'node:path';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import chalk from 'chalk';
import dotenv from 'dotenv';
import type { DocumentNode } from 'graphql';
import { z } from 'zod';

import { prismaClient } from '@/lib';

import { SpaceXAPI, UserAPI } from './datasources';
import { resolvers } from './resolvers';
import { getDirname } from '@/utils';

dotenv.config({ path: '.env' });

const typeDefs = loadSchemaSync(
  join(getDirname(import.meta.url), './graphql/schema.graphql'),
  {
    loaders: [new GraphQLFileLoader()],
  },
) as unknown as DocumentNode;

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
      const user = await prismaClient.user.findUnique({
        where: { email: userEmail },
      });
      isUserExists = Boolean(user);
    }

    if (!isUserExists) userEmail = null;

    return {
      dataSources: {
        spaceXAPI: new SpaceXAPI(),
        userAPI: new UserAPI(userEmail),
      },
      userEmail,
    };
  },
  listen: { port: Number(process.env.PORT ?? 4000) },
});

console.info(chalk.cyanBright(`🚀 Server ready at ${chalk.blueBright(url)}`));
