import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/login', '/signup'];
const guestOnlyPaths = ['/login', '/signup'];

export default function proxy(request: NextRequest) {
  const isLoggedIn = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;

  if (isLoggedIn && guestOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!(isLoggedIn || publicPaths.includes(pathname))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
