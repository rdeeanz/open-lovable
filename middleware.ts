import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'admin') {
      if (session && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/member', request.url));
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  if (pathname.startsWith('/member')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  if (pathname === '/login' && session) {
    const destination = session.role === 'admin' ? '/admin' : '/member';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*', '/login'],
};
