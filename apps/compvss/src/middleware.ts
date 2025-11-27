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

const onboardingPath = '/onboarding';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isOnboardingPath = pathname.startsWith(onboardingPath);

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

  const { data: { session } } = await supabase.auth.getSession();

  if (!isPublicPath && !session) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicPath && session && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (session && !isPublicPath && !isOnboardingPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('platform_roles')
      .eq('auth_user_id', session?.user?.id)
      .single();

    const roles = platformUser?.platform_roles || [];
    const isAdmin = roles.some((role: string) => role.includes('ADMIN') || role.startsWith('LEGEND_'));

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
