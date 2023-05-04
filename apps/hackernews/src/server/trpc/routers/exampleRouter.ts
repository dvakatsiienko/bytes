/* Core */
import { z } from 'zod';

/* Instruments */
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/trpc/core';

export const exampleRouter = createTRPCRouter({
    hello: publicProcedure.input(z.object({ text: z.string() })).query((options) => {
        return { greeting: `Hello ${ options.input.text }` };
    }),

    getAll: publicProcedure.query((options) => {
        return options.ctx.prisma.example.findMany();
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return 'you can now see this secret message!';
    }),
});
