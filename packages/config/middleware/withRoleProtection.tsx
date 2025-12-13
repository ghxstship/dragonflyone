/**
 * Gap 1 Remediation: Role-Based Route Protection HOC
 * Provides consistent middleware-level role checking for all protected routes
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PlatformRole, PLATFORM_ROLE_METADATA, getAllInheritedRoles, isLegendRole } from '../roles';

// ============================================================================
// TYPES
// ============================================================================

export interface RouteProtectionConfig {
  /** Required platform roles (user must have at least one) */
  requiredRoles?: PlatformRole[];
  /** Required role level (god, admin, manager, member, viewer) */
  requiredLevel?: 'god' | 'admin' | 'manager' | 'member' | 'viewer';
  /** Required platform access */
  requiredPlatform?: 'atlvs' | 'compvss' | 'gvteway';
  /** Custom permission check */
  customCheck?: (user: ProtectedUser) => boolean | Promise<boolean>;
  /** Redirect path on unauthorized (default: /auth/signin) */
  unauthorizedRedirect?: string;
  /** Redirect path on forbidden (default: /403) */
  forbiddenRedirect?: string;
  /** Allow unauthenticated access */
  allowAnonymous?: boolean;
}

export interface ProtectedUser {
  id: string;
  authUserId: string;
  email: string;
  organizationId: string | null;
  roles: PlatformRole[];
  roleLevel: 'god' | 'admin' | 'manager' | 'member' | 'viewer';
}

export interface ProtectionResult {
  authorized: boolean;
  user: ProtectedUser | null;
  error?: string;
}

// ============================================================================
// ROLE LEVEL HIERARCHY
// ============================================================================

const ROLE_LEVEL_HIERARCHY: Record<string, number> = {
  god: 100,
  admin: 80,
  manager: 60,
  member: 40,
  viewer: 20,
};

function getRoleLevel(roles: PlatformRole[]): 'god' | 'admin' | 'manager' | 'member' | 'viewer' {
  let highestLevel = 0;
  let highestLevelName: 'god' | 'admin' | 'manager' | 'member' | 'viewer' = 'viewer';

  for (const role of roles) {
    const metadata = PLATFORM_ROLE_METADATA[role];
    if (metadata) {
      const levelValue = ROLE_LEVEL_HIERARCHY[metadata.level] || 0;
      if (levelValue > highestLevel) {
        highestLevel = levelValue;
        highestLevelName = metadata.level;
      }
    }
  }

  return highestLevelName;
}

// ============================================================================
// PROTECTION CHECK
// ============================================================================

export async function checkRouteProtection(
  config: RouteProtectionConfig = {}
): Promise<ProtectionResult> {
  const {
    requiredRoles = [],
    requiredLevel,
    requiredPlatform,
    customCheck,
    allowAnonymous = false,
  } = config;

  // Create Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // Get authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    if (allowAnonymous) {
      return { authorized: true, user: null };
    }
    return { authorized: false, user: null, error: 'Not authenticated' };
  }

  // Get platform user with roles
  const { data: platformUser, error: platformError } = await supabase
    .from('platform_users')
    .select('id, email, organization_id, platform_roles')
    .eq('auth_user_id', authUser.id)
    .single();

  if (platformError || !platformUser) {
    return { authorized: false, user: null, error: 'User profile not found' };
  }

  const userRoles = (platformUser.platform_roles || []) as PlatformRole[];
  const roleLevel = getRoleLevel(userRoles);

  const protectedUser: ProtectedUser = {
    id: platformUser.id,
    authUserId: authUser.id,
    email: platformUser.email || authUser.email || '',
    organizationId: platformUser.organization_id,
    roles: userRoles,
    roleLevel,
  };

  // Legend roles bypass all checks
  const hasLegendRole = userRoles.some(role => isLegendRole(role));
  if (hasLegendRole) {
    return { authorized: true, user: protectedUser };
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(requiredRole => {
      // Direct role match
      if (userRoles.includes(requiredRole)) return true;
      
      // Check inherited roles
      for (const userRole of userRoles) {
        const inherited = getAllInheritedRoles(userRole);
        if (inherited.includes(requiredRole)) return true;
      }
      
      return false;
    });

    if (!hasRequiredRole) {
      return { authorized: false, user: protectedUser, error: 'Insufficient role permissions' };
    }
  }

  // Check required level
  if (requiredLevel) {
    const requiredLevelValue = ROLE_LEVEL_HIERARCHY[requiredLevel] || 0;
    const userLevelValue = ROLE_LEVEL_HIERARCHY[roleLevel] || 0;

    if (userLevelValue < requiredLevelValue) {
      return { authorized: false, user: protectedUser, error: 'Insufficient role level' };
    }
  }

  // Check required platform
  if (requiredPlatform) {
    const hasPlatformAccess = userRoles.some(role => {
      const metadata = PLATFORM_ROLE_METADATA[role];
      return metadata && metadata.platform === requiredPlatform;
    });

    if (!hasPlatformAccess) {
      return { authorized: false, user: protectedUser, error: 'No access to this platform' };
    }
  }

  // Custom check
  if (customCheck) {
    const customResult = await customCheck(protectedUser);
    if (!customResult) {
      return { authorized: false, user: protectedUser, error: 'Custom authorization check failed' };
    }
  }

  return { authorized: true, user: protectedUser };
}

// ============================================================================
// SERVER COMPONENT HOC
// ============================================================================

export function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P & { user: ProtectedUser }>,
  config: RouteProtectionConfig = {}
) {
  const {
    unauthorizedRedirect = '/auth/signin',
    forbiddenRedirect = '/403',
  } = config;

  return async function ProtectedComponent(props: P) {
    const result = await checkRouteProtection(config);

    if (!result.authorized) {
      if (result.error === 'Not authenticated') {
        redirect(unauthorizedRedirect);
      }
      redirect(forbiddenRedirect);
    }

    if (!result.user && !config.allowAnonymous) {
      redirect(unauthorizedRedirect);
    }

    return <WrappedComponent {...props} user={result.user!} />;
  };
}

// ============================================================================
// PRE-CONFIGURED PROTECTION CONFIGS
// ============================================================================

/** Require any authenticated user */
export const requireAuth: RouteProtectionConfig = {};

/** Require Legend role (god mode) */
export const requireLegend: RouteProtectionConfig = {
  requiredLevel: 'god',
};

/** Require admin level or higher */
export const requireAdmin: RouteProtectionConfig = {
  requiredLevel: 'admin',
};

/** Require manager level or higher */
export const requireManager: RouteProtectionConfig = {
  requiredLevel: 'manager',
};

// ATLVS-specific configs
export const requireAtlvsAdmin: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN],
  requiredPlatform: 'atlvs',
};

export const requireAtlvsTeamMember: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
  requiredPlatform: 'atlvs',
};

export const requireAtlvsViewer: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
  requiredPlatform: 'atlvs',
};

// COMPVSS-specific configs
export const requireCompvssAdmin: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.COMPVSS_ADMIN],
  requiredPlatform: 'compvss',
};

export const requireCompvssTeamMember: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
  requiredPlatform: 'compvss',
};

export const requireCompvssViewer: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR, PlatformRole.COMPVSS_VIEWER],
  requiredPlatform: 'compvss',
};

// GVTEWAY-specific configs
export const requireGvtewayAdmin: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.GVTEWAY_ADMIN],
  requiredPlatform: 'gvteway',
};

export const requireGvtewayExperienceCreator: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
  requiredPlatform: 'gvteway',
};

export const requireGvtewayVenueManager: RouteProtectionConfig = {
  requiredRoles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER],
  requiredPlatform: 'gvteway',
};

export const requireGvtewayMember: RouteProtectionConfig = {
  requiredRoles: [
    PlatformRole.GVTEWAY_ADMIN,
    PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
    PlatformRole.GVTEWAY_VENUE_MANAGER,
    PlatformRole.GVTEWAY_ARTIST_VERIFIED,
    PlatformRole.GVTEWAY_ARTIST,
    PlatformRole.GVTEWAY_MEMBER_EXTRA,
    PlatformRole.GVTEWAY_MEMBER_PLUS,
    PlatformRole.GVTEWAY_MEMBER,
    PlatformRole.GVTEWAY_MEMBER_GUEST,
    PlatformRole.GVTEWAY_AFFILIATE,
    PlatformRole.GVTEWAY_MODERATOR,
  ],
  requiredPlatform: 'gvteway',
};

