import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isPublic = ['/', '/login'].includes(nextUrl.pathname);

      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (!(isLoggedIn || isPublic)) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
  pages: { signIn: '/login' },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
