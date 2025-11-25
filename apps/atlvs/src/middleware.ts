import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  '/finance': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/analytics': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/workforce': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/crm': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_TEAM_MEMBER'],
  '/projects': ['ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicPaths = ['/', '/auth/signin', '/auth/signup'];
  const isPublicPath = publicPaths.includes(path);

  const token = request.cookies.get('auth-token')?.value || '';
  const userRole = request.cookies.get('user-role')?.value || '';

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (isPublicPath && token && path !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based access control
  for (const [protectedPath, allowedRoles] of Object.entries(ROLE_ACCESS_MAP)) {
    if (path.startsWith(protectedPath)) {
      if (!allowedRoles.includes(userRole) && !userRole.startsWith('LEGEND_')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
