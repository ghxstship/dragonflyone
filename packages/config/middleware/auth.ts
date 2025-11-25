import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface AuthMiddlewareConfig {
  requiredRoles?: string[];
  requireAuth?: boolean;
  allowAnonymous?: boolean;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  platformUserId: string;
  organizationId: string | null;
  roles: string[];
}

export interface AuthResult {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  error?: string;
}

export async function authenticateRequest(
  request: NextRequest,
  config: AuthMiddlewareConfig = {}
): Promise<AuthResult> {
  const { requiredRoles = [], requireAuth = true, allowAnonymous = false } = config;
  
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    if (allowAnonymous) {
      return { authenticated: false, user: null };
    }
    return { authenticated: false, user: null, error: 'No authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    if (allowAnonymous) {
      return { authenticated: false, user: null };
    }
    return { authenticated: false, user: null, error: 'Invalid token format' };
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      if (allowAnonymous) {
        return { authenticated: false, user: null };
      }
      return { authenticated: false, user: null, error: 'Invalid or expired token' };
    }
    
    // Get platform user
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id, email, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();
    
    if (platformError || !platformUser) {
      return { authenticated: false, user: null, error: 'User profile not found' };
    }
    
    const userRoles = platformUser.platform_roles || [];
    
    // Check required roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      // Legend roles have access to everything
      const isLegend = userRoles.some((role: string) => role.startsWith('LEGEND_'));
      
      if (!hasRequiredRole && !isLegend) {
        return { authenticated: true, user: null, error: 'Insufficient permissions' };
      }
    }
    
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        platformUserId: platformUser.id,
        organizationId: platformUser.organization_id,
        roles: userRoles,
      },
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { authenticated: false, user: null, error: 'Authentication failed' };
  }
}

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  return async function authMiddleware(
    request: NextRequest
  ): Promise<{ response: NextResponse | null; user: AuthenticatedUser | null }> {
    const result = await authenticateRequest(request, config);
    
    if (!result.authenticated && config.requireAuth !== false) {
      return {
        response: NextResponse.json(
          { error: result.error || 'Unauthorized' },
          { status: 401 }
        ),
        user: null,
      };
    }
    
    if (result.error === 'Insufficient permissions') {
      return {
        response: NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        ),
        user: null,
      };
    }
    
    return { response: null, user: result.user };
  };
}

// Pre-configured auth middlewares
export const requireAuth = createAuthMiddleware({ requireAuth: true });

export const requireAdmin = createAuthMiddleware({
  requireAuth: true,
  requiredRoles: ['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPER_ADMIN'],
});

export const requireLegend = createAuthMiddleware({
  requireAuth: true,
  requiredRoles: ['LEGEND_ADMIN', 'LEGEND_SUPER_ADMIN'],
});

export const optionalAuth = createAuthMiddleware({
  requireAuth: false,
  allowAnonymous: true,
});

// Role-specific middlewares
export const requireAtlvsAccess = createAuthMiddleware({
  requireAuth: true,
  requiredRoles: ['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'ATLVS_VIEWER'],
});

export const requireCompvssAccess = createAuthMiddleware({
  requireAuth: true,
  requiredRoles: ['COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'COMPVSS_VIEWER'],
});

export const requireGvtewayAccess = createAuthMiddleware({
  requireAuth: true,
  requiredRoles: ['GVTEWAY_ADMIN', 'GVTEWAY_TEAM_MEMBER', 'GVTEWAY_VIEWER'],
});
