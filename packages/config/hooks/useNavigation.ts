/**
 * Navigation Hooks for GHXSTSHIP Platform
 * Role-based visibility, context switching, and navigation state management
 */

import { useMemo, useCallback } from 'react';
import {
  PlatformRole,
  EventRole,
  Permission,
  PLATFORM_ROLE_METADATA,
  EVENT_ROLE_PERMISSIONS,
  EVENT_ROLE_PLATFORM_ACCESS,
  EVENT_ROLE_HIERARCHY,
  isLegendRole,
  getAllInheritedRoles,
} from '../roles';

// =============================================================================
// TYPES
// =============================================================================

export type AppContext = 'atlvs' | 'compvss' | 'gvteway';
export type NavigationLevel = 'platform' | 'event';

export interface NavigationContext {
  level: NavigationLevel;
  app: AppContext;
  organizationId?: string;
  productionId?: string;
  eventId?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  badge?: string | number;
  roles?: (PlatformRole | EventRole)[];
  permissions?: Permission[];
  contextLevel: NavigationLevel | 'both';
  apps?: AppContext[];
  hidden?: boolean;
}

export interface NavSection {
  section: string;
  icon?: string;
  items: NavItem[];
  subsections?: Array<{
    label: string;
    items: NavItem[];
  }>;
  roles?: (PlatformRole | EventRole)[];
  permissions?: Permission[];
  contextLevel?: NavigationLevel | 'both';
}

export interface UserRoleContext {
  platformRole: PlatformRole;
  eventRoles?: EventRole[];
  currentEventRole?: EventRole;
  permissions: Permission[];
}

// =============================================================================
// NAVIGATION VISIBILITY MATRICES
// =============================================================================

/** Platform-level navigation visibility by role */
export const ATLVS_PLATFORM_NAV_VISIBILITY: Record<string, PlatformRole[]> = {
  // Full access sections
  dashboard: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.ATLVS_VIEWER,
  ],
  productions: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.ATLVS_VIEWER,
  ],
  // Admin-only sections
  organization: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
  ],
  finance: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
  ],
  workforce: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
  ],
  crm: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
  ],
  assets: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
  ],
  analytics: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.ATLVS_VIEWER,
  ],
  integrations: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
  ],
  settings: [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.ATLVS_VIEWER,
  ],
};

/** Event-level navigation visibility by role */
export const ATLVS_EVENT_NAV_VISIBILITY: Record<string, EventRole[]> = {
  overview: Object.values(EventRole),
  planning: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
    EventRole.MANAGEMENT,
  ],
  advancing: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
    EventRole.MANAGEMENT,
    EventRole.CREW,
    EventRole.STAFF,
    EventRole.VENDOR,
  ],
  people: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
    EventRole.MANAGEMENT,
  ],
  finance: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.MANAGEMENT,
  ],
  compliance: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
    EventRole.MANAGEMENT,
  ],
  marketing: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.MANAGEMENT,
  ],
  metrics: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
    EventRole.MANAGEMENT,
  ],
  documents: Object.values(EventRole).filter(
    (r) =>
      EVENT_ROLE_HIERARCHY[r] >= EVENT_ROLE_HIERARCHY[EventRole.VOLUNTEER]
  ),
  settings: [
    EventRole.EXECUTIVE,
    EventRole.CORE_AAA,
    EventRole.AA,
    EventRole.PRODUCTION,
  ],
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get user's effective permissions based on platform and event roles
 */
export function usePermissions(userContext: UserRoleContext) {
  return useMemo(() => {
    const permissions = new Set<Permission>();

    // Add permissions from event role if present
    if (userContext.currentEventRole) {
      const eventPermissions =
        EVENT_ROLE_PERMISSIONS[userContext.currentEventRole] || [];
      eventPermissions.forEach((p) => permissions.add(p));
    }

    // Add any explicit permissions
    userContext.permissions.forEach((p) => permissions.add(p));

    // Legend roles get all permissions
    if (isLegendRole(userContext.platformRole)) {
      return {
        permissions: Array.from(permissions),
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
      };
    }

    return {
      permissions: Array.from(permissions),
      hasPermission: (permission: Permission) => permissions.has(permission),
      hasAnyPermission: (perms: Permission[]) =>
        perms.some((p) => permissions.has(p)),
      hasAllPermissions: (perms: Permission[]) =>
        perms.every((p) => permissions.has(p)),
    };
  }, [
    userContext.platformRole,
    userContext.currentEventRole,
    userContext.permissions,
  ]);
}

/**
 * Hook to check if user has access to a specific navigation section
 */
export function useNavigationAccess(
  userContext: UserRoleContext,
  context: NavigationContext
) {
  const { hasPermission, hasAnyPermission } = usePermissions(userContext);

  const canAccessSection = useCallback(
    (sectionId: string): boolean => {
      // Legend roles can access everything
      if (isLegendRole(userContext.platformRole)) {
        return true;
      }

      // Check platform-level visibility
      if (context.level === 'platform') {
        const allowedRoles = ATLVS_PLATFORM_NAV_VISIBILITY[sectionId];
        if (allowedRoles) {
          // Check direct role match
          if (allowedRoles.includes(userContext.platformRole)) {
            return true;
          }
          // Check inherited roles
          const inherited = getAllInheritedRoles(userContext.platformRole);
          return inherited.some((r) => allowedRoles.includes(r));
        }
      }

      // Check event-level visibility
      if (context.level === 'event' && userContext.currentEventRole) {
        const allowedEventRoles = ATLVS_EVENT_NAV_VISIBILITY[sectionId];
        if (allowedEventRoles) {
          return allowedEventRoles.includes(userContext.currentEventRole);
        }
      }

      return false;
    },
    [userContext, context.level]
  );

  const canAccessItem = useCallback(
    (item: NavItem): boolean => {
      // Legend roles can access everything
      if (isLegendRole(userContext.platformRole)) {
        return true;
      }

      // Check context level
      if (
        item.contextLevel !== 'both' &&
        item.contextLevel !== context.level
      ) {
        return false;
      }

      // Check app restriction
      if (item.apps && !item.apps.includes(context.app)) {
        return false;
      }

      // Check role restrictions
      if (item.roles && item.roles.length > 0) {
        const hasRole = item.roles.some((role) => {
          if (Object.values(PlatformRole).includes(role as PlatformRole)) {
            return (
              userContext.platformRole === role ||
              getAllInheritedRoles(userContext.platformRole).includes(
                role as PlatformRole
              )
            );
          }
          if (Object.values(EventRole).includes(role as EventRole)) {
            return userContext.currentEventRole === role;
          }
          return false;
        });
        if (!hasRole) return false;
      }

      // Check permission restrictions
      if (item.permissions && item.permissions.length > 0) {
        if (!hasAnyPermission(item.permissions)) {
          return false;
        }
      }

      return true;
    },
    [userContext, context, hasAnyPermission]
  );

  return {
    canAccessSection,
    canAccessItem,
    hasPermission,
    hasAnyPermission,
  };
}

/**
 * Hook to filter navigation based on user role and context
 */
export function useRoleAwareNavigation(
  navigation: NavSection[],
  userContext: UserRoleContext,
  context: NavigationContext
): NavSection[] {
  const { canAccessSection, canAccessItem } = useNavigationAccess(
    userContext,
    context
  );

  return useMemo(() => {
    return navigation
      .filter((section) => {
        // Check section-level role restrictions
        if (section.roles && section.roles.length > 0) {
          const hasRole = section.roles.some((role) => {
            if (Object.values(PlatformRole).includes(role as PlatformRole)) {
              return (
                userContext.platformRole === role ||
                getAllInheritedRoles(userContext.platformRole).includes(
                  role as PlatformRole
                )
              );
            }
            if (Object.values(EventRole).includes(role as EventRole)) {
              return userContext.currentEventRole === role;
            }
            return false;
          });
          if (!hasRole) return false;
        }

        // Check section visibility
        const sectionId = section.section.toLowerCase().replace(/\s+/g, '-');
        return canAccessSection(sectionId);
      })
      .map((section) => ({
        ...section,
        items: section.items.filter(canAccessItem),
        subsections: section.subsections
          ?.map((sub) => ({
            ...sub,
            items: sub.items.filter(canAccessItem),
          }))
          .filter((sub) => sub.items.length > 0),
      }))
      .filter(
        (section) =>
          section.items.length > 0 ||
          (section.subsections && section.subsections.length > 0)
      );
  }, [navigation, userContext, canAccessSection, canAccessItem]);
}

/**
 * Hook to manage navigation context state
 */
export function useNavigationContext(initialContext: NavigationContext) {
  const getContextPath = useCallback(
    (context: NavigationContext, path: string): string => {
      if (context.level === 'event') {
        if (context.app === 'gvteway' && context.eventId) {
          return `/e/${context.eventId}${path}`;
        }
        if (context.productionId) {
          return `/p/${context.productionId}${path}`;
        }
      }
      return path;
    },
    []
  );

  const isInEventContext = useCallback(
    (context: NavigationContext): boolean => {
      return (
        context.level === 'event' &&
        Boolean(context.productionId || context.eventId)
      );
    },
    []
  );

  const getPlatformPath = useCallback((): string => {
    return '/dashboard';
  }, []);

  return {
    getContextPath,
    isInEventContext,
    getPlatformPath,
    initialContext,
  };
}

/**
 * Hook to check if user can access a specific app
 */
export function useAppAccess(userContext: UserRoleContext) {
  return useMemo(() => {
    const canAccessApp = (app: AppContext): boolean => {
      // Legend roles can access all apps
      if (isLegendRole(userContext.platformRole)) {
        return true;
      }

      // Check platform role
      const metadata = PLATFORM_ROLE_METADATA[userContext.platformRole];
      if (metadata.platform === app || metadata.platform === 'legend') {
        return true;
      }

      // Check event role platform access
      if (userContext.currentEventRole) {
        return EVENT_ROLE_PLATFORM_ACCESS[userContext.currentEventRole].includes(
          app
        );
      }

      return false;
    };

    return {
      canAccessAtlvs: canAccessApp('atlvs'),
      canAccessCompvss: canAccessApp('compvss'),
      canAccessGvteway: canAccessApp('gvteway'),
      canAccessApp,
    };
  }, [userContext]);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  Permission,
  PlatformRole,
  EventRole,
} from '../roles';
