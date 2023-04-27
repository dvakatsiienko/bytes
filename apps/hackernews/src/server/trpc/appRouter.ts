/* Instruments */
import { createTRPCRouter } from './core';
import * as routers from './routers';

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    example: routers.exampleRouter,
    user:    routers.userRouter,
});

/* Types */
export type AppRouter = typeof appRouter; // export type definition of API
