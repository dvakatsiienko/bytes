/* Core */
import NextAuth from 'next-auth';
import { NextApiHandler } from 'next';

/* Instruments */
import { createNextAuthOptions } from '@/server/auth';

const nextAuthHandler: NextApiHandler = (req, res) => {
    return NextAuth(...createNextAuthOptions(req, res));
};

export default nextAuthHandler;
