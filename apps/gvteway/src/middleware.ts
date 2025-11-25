import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicPaths = ['/', '/events', '/auth/signin', '/auth/signup', '/design-system'];
  const isPublicPath = publicPaths.includes(path);

  const token = request.cookies.get('auth-token')?.value || '';

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (isPublicPath && token && !['/','/ events', '/design-system'].includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
