/* Core */
import { z } from 'zod';

/* Instruments */
import { createTRPCRouter, publicProcedure } from '@/server/trpc/core';
import { prisma } from '@/server/prisma';

export const userRouter = createTRPCRouter({
    getCurrentUserProfile: publicProcedure
        .input(z.object({ email: z.coerce.string().email() }))
        .query(async (options) => {
            const user = await prisma.user.findFirst({ where: { email: options.input.email }});

            return { user };
        }),
});
