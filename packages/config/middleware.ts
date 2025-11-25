import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from './supabase-client';
import { PlatformRole, Permission } from './roles';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    platformRoles: PlatformRole[];
    eventRoles?: Record<string, string[]>;
  };
}

// Platform role permissions mapping
const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, Permission[]> = {
  // Legend roles have all permissions
  [PlatformRole.LEGEND_SUPER_ADMIN]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_ADMIN]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_DEVELOPER]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_COLLABORATOR]: ['events:create', 'events:edit', 'events:view', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:view'],
  [PlatformRole.LEGEND_SUPPORT]: ['events:view', 'projects:view', 'tasks:view', 'budgets:view', 'orders:view'],
  [PlatformRole.LEGEND_INCOGNITO]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  // ATLVS roles
  [PlatformRole.ATLVS_SUPER_ADMIN]: ['projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'users:manage'],
  [PlatformRole.ATLVS_ADMIN]: ['projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view'],
  [PlatformRole.ATLVS_TEAM_MEMBER]: ['projects:view', 'tasks:view', 'budgets:view'],
  [PlatformRole.ATLVS_VIEWER]: ['projects:view', 'tasks:view'],
  // COMPVSS roles
  [PlatformRole.COMPVSS_ADMIN]: ['events:create', 'events:edit', 'events:view', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'advancing:approve', 'budgets:view'],
  [PlatformRole.COMPVSS_TEAM_MEMBER]: ['events:view', 'projects:view', 'tasks:view', 'advancing:submit'],
  [PlatformRole.COMPVSS_COLLABORATOR]: ['events:view', 'projects:view', 'tasks:view'],
  [PlatformRole.COMPVSS_VIEWER]: ['events:view', 'projects:view'],
  // GVTEWAY roles
  [PlatformRole.GVTEWAY_ADMIN]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'users:manage'],
  [PlatformRole.GVTEWAY_EXPERIENCE_CREATOR]: ['events:create', 'events:edit', 'events:view', 'tickets:manage', 'orders:view'],
  [PlatformRole.GVTEWAY_VENUE_MANAGER]: ['events:view', 'venue:access:all'],
  [PlatformRole.GVTEWAY_ARTIST_VERIFIED]: ['events:view', 'orders:view:own'],
  [PlatformRole.GVTEWAY_ARTIST]: ['events:view', 'orders:view:own'],
  [PlatformRole.GVTEWAY_MEMBER_EXTRA]: ['events:view', 'orders:view:own'],
  [PlatformRole.GVTEWAY_MEMBER_PLUS]: ['events:view', 'orders:view:own'],
  [PlatformRole.GVTEWAY_MEMBER]: ['events:view', 'orders:view:own'],
  [PlatformRole.GVTEWAY_MEMBER_GUEST]: ['events:view'],
  [PlatformRole.GVTEWAY_AFFILIATE]: ['events:view', 'orders:view:own', 'referral:create', 'commission:view'],
  [PlatformRole.GVTEWAY_MODERATOR]: ['events:view', 'users:manage'],
};

/**
 * Authentication middleware - validates JWT and attaches user to request
 */
export async function withAuth(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    );
  }

  // Fetch user roles from database
  const { data: userData } = await supabase
    .from('platform_users')
    .select('platform_roles, event_roles')
    .eq('id', user.id)
    .single();

  interface UserData {
    platform_roles?: PlatformRole[];
    event_roles?: Record<string, string[]>;
  }

  const typedUserData = userData as UserData | null;

  return {
    user: {
      id: user.id,
      email: user.email,
      platformRoles: typedUserData?.platform_roles || [],
      eventRoles: typedUserData?.event_roles || {},
    },
  };
}

/**
 * Role-based authorization middleware
 */
export function withRole(...requiredRoles: PlatformRole[]) {
  return async (_request: NextRequest, userData: unknown) => {
    const data = userData as { user?: { platformRoles?: PlatformRole[] } };
    if (!data?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRoles = data.user.platformRoles || [];
    const hasRole = requiredRoles.some((role: PlatformRole) => userRoles.includes(role));

    if (!hasRole) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    return null; // Success
  };
}

/**
 * Permission-based authorization middleware
 */
export function withPermission(requiredPermission: Permission) {
  return async (_request: NextRequest, userData: unknown) => {
    const data = userData as { user?: { platformRoles?: PlatformRole[] } };
    if (!data?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRoles = data.user.platformRoles || [];
    
    // Check if user has required permission through any role
    const hasPermission = userRoles.some((role: PlatformRole) => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[role] || [];
      return permissions.includes(requiredPermission);
    });

    if (!hasPermission) {
      return NextResponse.json(
        { error: `Forbidden - Missing permission: ${requiredPermission}` },
        { status: 403 }
      );
    }

    return null; // Success
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      record = { count: 0, resetAt: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        },
        { status: 429 }
      );
    }

    return null; // Success
  };
}

/**
 * Request validation middleware using Zod schemas
 */
export function withValidation<T>(schema: any) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return { validated };
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors || error.message,
        },
        { status: 400 }
      );
    }
  };
}

/**
 * Audit logging middleware
 */
export async function withAudit(
  request: NextRequest,
  userData: any,
  action: string,
  resource: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  try {
    await (supabase as any).from('audit_logs').insert({
      user_id: userData?.user?.id,
      action,
      resource,
      resource_id: request.nextUrl.pathname.split('/').pop(),
      ip_address: request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    } as any);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * CORS middleware
 */
export function withCORS(allowedOrigins: string[] = ['*']) {
  return (response: NextResponse) => {
    const origin = allowedOrigins.includes('*') 
      ? '*' 
      : allowedOrigins[0];

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  };
}

/**
 * Caching middleware
 */
export function withCache(ttl: number = 300) {
  return (response: NextResponse) => {
    response.headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`);
    return response;
  };
}

/**
 * Compression middleware
 */
export function withCompression() {
  return (response: NextResponse) => {
    response.headers.set('Content-Encoding', 'gzip');
    return response;
  };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders() {
  return (response: NextResponse) => {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    );
    return response;
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Function[]) {
  return async (request: NextRequest, ...args: any[]) => {
    for (const middleware of middlewares) {
      const result = await middleware(request, ...args);
      if (result instanceof NextResponse) {
        return result; // Error response
      }
      if (result !== null && result !== undefined) {
        args.push(result); // Pass result to next middleware
      }
    }
    return null;
  };
}

/**
 * API route wrapper with common middleware
 */
export function apiRoute(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    auth?: boolean;
    roles?: PlatformRole[];
    permission?: Permission;
    rateLimit?: { maxRequests: number; windowMs: number };
    validation?: any;
    audit?: { action: string; resource: string };
  } = {}
) {
  return async (request: NextRequest, context: any = {}) => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await withRateLimit(
          options.rateLimit.maxRequests,
          options.rateLimit.windowMs
        )(request);
        if (rateLimitResult) return rateLimitResult;
      }

      // Authentication
      let userData;
      if (options.auth) {
        const authResult = await withAuth(request);
        if (authResult instanceof NextResponse) return authResult;
        userData = authResult;
      }

      // Role-based authorization
      if (options.roles && options.roles.length > 0) {
        const roleResult = await withRole(...options.roles)(request, userData);
        if (roleResult) return roleResult;
      }

      // Permission-based authorization
      if (options.permission) {
        const permResult = await withPermission(options.permission as Permission)(request, userData);
        if (permResult) return permResult;
      }

      // Request validation
      let validatedData;
      if (options.validation) {
        const validationResult = await withValidation(options.validation)(request);
        if (validationResult instanceof NextResponse) return validationResult;
        validatedData = validationResult.validated;
      }

      // Audit logging
      if (options.audit && userData) {
        await withAudit(
          request,
          userData,
          options.audit.action,
          options.audit.resource
        );
      }

      // Execute handler
      const response = await handler(request, {
        ...context,
        user: userData?.user,
        validated: validatedData,
      });

      // Apply security headers
      return withSecurityHeaders()(response);
    } catch (error: any) {
      console.error('API route error:', error);
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: error.message,
        },
        { status: 500 }
      );
    }
  };
}
