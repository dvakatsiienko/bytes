import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

// ? User creds
// user@nextmail.com
// 123456

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export default NextAuth(authConfig).auth;
