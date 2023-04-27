/* Core */
// import bcrypt from 'bcryptjs';
// import { faker } from '@faker-js/faker';

/* Instruments */
import { prisma } from './client';

export const createUsers = async () => {
    // const password = await bcrypt.hash('12345', 10);

    const admin = await prisma.user.create({
        data: {
            email:         'admin@email.io',
            password:      '12345',
            name:          'Admin',
            emailVerified: new Date(),
        },
    });

    return { admin };
};
