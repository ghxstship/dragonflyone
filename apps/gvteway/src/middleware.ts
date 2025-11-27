import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const publicPaths = [
  // Home
  '/',
  
  // Auth flows
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/magic-link',
  '/auth/verify-email',
  '/auth/callback',
  '/api/auth',
  '/(auth)/login',
  
  // Public discovery & browsing (SEO + user acquisition)
  '/events',
  '/artists',
  '/venues',
  '/browse',
  '/search',
  '/calendar',
  '/tours',
  '/destinations',
  '/discover',
  '/collections',
  '/nearby',
  '/new-events',
  '/deals',
  '/packages',
  
  // Public commerce (browsing only)
  '/merch',
  '/gift-cards',
  '/resale', // Browsing resale listings
  
  // Public community content
  '/community/guidelines',
  '/fan-clubs', // Browsing fan clubs
  
  // Support & accessibility (must be public)
  '/help',
  '/support/chat',
  '/accessibility',
  
  // Development
  '/design-system',
];

const onboardingPath = '/onboarding';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
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

  if (pathname.startsWith('/auth/') && session && !pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL('/', request.url));
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

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
