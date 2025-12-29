import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { createServerClient } from './supabase-client';
import { PlatformRole, Permission, PLATFORM_ROLE_PERMISSIONS } from './roles';

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

/**
 * Authentication middleware - validates JWT and attaches user to request
 */
export async function withAuth(_request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);
  
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
export function withValidation<T>(schema: { parse: (data: unknown) => T }) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return { validated };
    } catch (error: unknown) {
      const zodError = error as { errors?: unknown[]; message?: string };
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: zodError.errors || zodError.message,
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
  userData: { user?: { id: string } } | null,
  action: string,
  resource: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey);

  try {
    await supabase.from('audit_logs').insert({
      user_id: userData?.user?.id ?? null,
      action,
      resource_type: resource,
      resource_id: request.nextUrl.pathname.split('/').pop() ?? null,
      ip_address: request.headers.get('x-forwarded-for'),
      user_agent: request.headers.get('user-agent'),
    });
  } catch (error) {
    logger.error('Audit log error', error instanceof Error ? error : undefined);
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
export function compose(...middlewares: ((...args: unknown[]) => Promise<unknown>)[]) {
  return async (request: NextRequest, ...args: unknown[]) => {
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
 * Context provided to API route handlers by the apiRoute middleware
 */
export interface ApiRouteContext {
  params?: Promise<Record<string, string>>;
  user?: {
    id: string;
    email?: string;
    platformRoles?: PlatformRole[];
    eventRoles?: Record<string, string[]>;
  };
  validated?: unknown;
  [key: string]: unknown;
}

/**
 * API route wrapper with common middleware
 */
export function apiRoute(
  handler: (request: NextRequest, context: ApiRouteContext) => Promise<NextResponse>,
  options: {
    auth?: boolean;
    roles?: PlatformRole[];
    permission?: Permission;
    rateLimit?: { maxRequests: number; windowMs: number };
    validation?: { parse: (data: unknown) => unknown };
    audit?: { action: string; resource: string };
  } = {}
) {
  return async (request: NextRequest, context: ApiRouteContext = {}) => {
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
    } catch (error: unknown) {
      logger.error('API route error', error instanceof Error ? error : undefined);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: errorMessage,
        },
        { status: 500 }
      );
    }
  };
}
