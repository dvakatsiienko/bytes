import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = Boolean(auth?.user);
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            console.info('AUTH', isLoggedIn, auth?.user);

            if (isOnDashboard) {
                if (isLoggedIn) return true;

                return false; // Redirect unauthenticated users to login page
            }
            if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
    },
    pages: { signIn: '/login' },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
