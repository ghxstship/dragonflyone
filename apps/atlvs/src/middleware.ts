import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Simple in-memory rate limiting for API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  entry.count++;
  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  return { allowed: entry.count <= RATE_LIMIT, remaining };
}

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
  
  // Marketing & product pages
  '/verticals',
  '/features',
  '/pricing',
  '/integrations',
  '/security',
  '/changelog',
  '/demo',
  
  // Resources
  '/help',
  '/docs',
  '/blog',
  '/guides',
  '/case-studies',
  '/templates',
  
  // Company
  '/about',
  '/careers',
  '/press',
  '/partners',
  '/contact',
  
  // Legal & status
  '/legal',
  '/status',
];

const onboardingPath = '/onboarding';

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  '/finance': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/analytics': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/workforce': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'],
  '/crm': ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_TEAM_MEMBER'],
  '/projects': ['ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const { allowed, remaining } = checkRateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      );
    }
    
    const response = NextResponse.next({ request });
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }
  
  const response = NextResponse.next({ request });

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
  const isOnboardingPath = pathname.startsWith(onboardingPath);

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
  if (!isPublicPath && !isOnboardingPath && !session) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if authenticated and trying to access auth pages (not other public pages)
  if (pathname.startsWith('/auth/') && session && !pathname.startsWith('/auth/callback')) {
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
