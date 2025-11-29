import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/magic-link',
  '/auth/verify-email',
  '/auth/callback',
  '/api/auth',
];

const _onboardingPath = '/onboarding';

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  '/finance': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/analytics': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/workforce': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/crm': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_TEAM_MEMBER'],
  '/projects': ['ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const _isOnboardingPath = pathname.startsWith(_onboardingPath);

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to signin if not authenticated and trying to access protected route
  if (!isPublicPath && !session) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (isPublicPath && session && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get user roles for authenticated users
  let userRoles: string[] = [];
  if (session) {
    // Get platform user and their roles
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (platformUser) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role_code')
        .eq('platform_user_id', platformUser.id);
      
      userRoles = roles?.map(r => r.role_code) || [];
    }
  }

  // Role-based access control for admin routes
  for (const [protectedPath, allowedRoles] of Object.entries(ROLE_ACCESS_MAP)) {
    if (pathname.startsWith(protectedPath) && session) {
      const hasAccess = allowedRoles.some(role => userRoles.includes(role)) || 
                        userRoles.some(role => role.startsWith('LEGEND_'));

      if (!hasAccess) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
