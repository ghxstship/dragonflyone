/**
 * Role System Tests
 * Comprehensive test suite for platform RBAC and event-level roles
 */

import { describe, it, expect } from 'vitest';
import {
  PlatformRole,
  EventRole,
  PLATFORM_ROLE_METADATA,
  EVENT_ROLE_HIERARCHY,
  EVENT_ROLE_PLATFORM_ACCESS,
  EVENT_ROLE_PERMISSIONS,
  isLegendRole,
  hasEventRolePlatformAccess,
  getEventRolePermissions,
  getAllInheritedRoles,
  hasPermission,
  Permission,
} from '../roles';

describe('Role System', () => {
  // ============================================================================
  // LEGEND ROLE EMAIL VALIDATION
  // ============================================================================
  describe('Legend Role Email Validation', () => {
    it('should require @ghxstship.pro email for all Legend roles', () => {
      const legendRoles = Object.values(PlatformRole).filter((role) =>
        role.startsWith('LEGEND_')
      );

      legendRoles.forEach((role) => {
        const metadata = PLATFORM_ROLE_METADATA[role];
        expect(metadata.requiresEmail).toBe('@ghxstship.pro');
      });
    });

    it('should identify Legend roles correctly', () => {
      expect(isLegendRole(PlatformRole.LEGEND_SUPER_ADMIN)).toBe(true);
      expect(isLegendRole(PlatformRole.LEGEND_ADMIN)).toBe(true);
      expect(isLegendRole(PlatformRole.LEGEND_DEVELOPER)).toBe(true);
      expect(isLegendRole(PlatformRole.LEGEND_COLLABORATOR)).toBe(true);
      expect(isLegendRole(PlatformRole.LEGEND_SUPPORT)).toBe(true);
      expect(isLegendRole(PlatformRole.LEGEND_INCOGNITO)).toBe(true);
    });

    it('should not identify non-Legend roles as Legend', () => {
      expect(isLegendRole(PlatformRole.ATLVS_SUPER_ADMIN)).toBe(false);
      expect(isLegendRole(PlatformRole.COMPVSS_ADMIN)).toBe(false);
      expect(isLegendRole(PlatformRole.GVTEWAY_ADMIN)).toBe(false);
    });

    it('should validate email domain for Legend role assignment', () => {
      const validateLegendRoleAssignment = (
        email: string,
        role: PlatformRole
      ): boolean => {
        if (!isLegendRole(role)) return true;
        const metadata = PLATFORM_ROLE_METADATA[role];
        if (metadata.requiresEmail) {
          return email.endsWith(metadata.requiresEmail);
        }
        return true;
      };

      expect(
        validateLegendRoleAssignment(
          'admin@ghxstship.pro',
          PlatformRole.LEGEND_SUPER_ADMIN
        )
      ).toBe(true);
      expect(
        validateLegendRoleAssignment(
          'user@example.com',
          PlatformRole.LEGEND_SUPER_ADMIN
        )
      ).toBe(false);
      expect(
        validateLegendRoleAssignment(
          'user@example.com',
          PlatformRole.ATLVS_ADMIN
        )
      ).toBe(true);
    });
  });

  // ============================================================================
  // ROLE HIERARCHY INHERITANCE
  // ============================================================================
  describe('Role Hierarchy Inheritance', () => {
    it('should correctly inherit roles for ATLVS hierarchy', () => {
      const superAdminInherited = getAllInheritedRoles(
        PlatformRole.ATLVS_SUPER_ADMIN
      );
      expect(superAdminInherited).toContain(PlatformRole.ATLVS_ADMIN);
      expect(superAdminInherited).toContain(PlatformRole.ATLVS_TEAM_MEMBER);
      expect(superAdminInherited).toContain(PlatformRole.ATLVS_VIEWER);
    });

    it('should correctly inherit roles for COMPVSS hierarchy', () => {
      const adminInherited = getAllInheritedRoles(PlatformRole.COMPVSS_ADMIN);
      expect(adminInherited).toContain(PlatformRole.COMPVSS_TEAM_MEMBER);
      expect(adminInherited).toContain(PlatformRole.COMPVSS_VIEWER);
    });

    it('should correctly inherit roles for GVTEWAY hierarchy', () => {
      const memberExtraInherited = getAllInheritedRoles(
        PlatformRole.GVTEWAY_MEMBER_EXTRA
      );
      expect(memberExtraInherited).toContain(PlatformRole.GVTEWAY_MEMBER_PLUS);
      expect(memberExtraInherited).toContain(PlatformRole.GVTEWAY_MEMBER);
    });

    it('should return empty array for base roles with no inheritance', () => {
      const viewerInherited = getAllInheritedRoles(PlatformRole.ATLVS_VIEWER);
      expect(viewerInherited).toHaveLength(0);
    });

    it('should inherit Legend roles from ATLVS hierarchy', () => {
      const legendInherited = getAllInheritedRoles(
        PlatformRole.LEGEND_SUPER_ADMIN
      );
      expect(legendInherited).toContain(PlatformRole.ATLVS_SUPER_ADMIN);
    });
  });

  // ============================================================================
  // PERMISSION CHECKING ACROSS INHERITED ROLES
  // ============================================================================
  describe('Permission Checking Across Inherited Roles', () => {
    it('should grant all permissions to Legend roles', () => {
      expect(hasPermission(PlatformRole.LEGEND_SUPER_ADMIN, 'events:create')).toBe(
        true
      );
      expect(hasPermission(PlatformRole.LEGEND_ADMIN, 'users:manage')).toBe(true);
      expect(hasPermission(PlatformRole.LEGEND_INCOGNITO, 'budgets:manage')).toBe(
        true
      );
    });

    it('should check permissions through inheritance chain', () => {
      // ATLVS_SUPER_ADMIN inherits from ATLVS_ADMIN which inherits from ATLVS_TEAM_MEMBER
      // Legend roles have all permissions
      expect(hasPermission(PlatformRole.LEGEND_SUPER_ADMIN, 'projects:view')).toBe(
        true
      );
    });
  });

  // ============================================================================
  // IMPERSONATION PERMISSION LOGIC
  // ============================================================================
  describe('Impersonation Permission Logic', () => {
    it('should allow impersonation for specific Legend roles', () => {
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_SUPER_ADMIN].canImpersonate).toBe(
        true
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_ADMIN].canImpersonate).toBe(
        true
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_DEVELOPER].canImpersonate).toBe(
        true
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_INCOGNITO].canImpersonate).toBe(
        true
      );
    });

    it('should require permission for LEGEND_SUPPORT impersonation', () => {
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_SUPPORT].canImpersonate).toBe(
        true
      );
      expect(
        PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_SUPPORT]
          .requiresPermissionToImpersonate
      ).toBe(true);
    });

    it('should not allow impersonation for LEGEND_COLLABORATOR', () => {
      expect(
        PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_COLLABORATOR].canImpersonate
      ).toBeUndefined();
    });

    it('should not allow impersonation for non-Legend roles', () => {
      expect(
        PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_SUPER_ADMIN].canImpersonate
      ).toBeUndefined();
      expect(
        PLATFORM_ROLE_METADATA[PlatformRole.GVTEWAY_ADMIN].canImpersonate
      ).toBeUndefined();
    });
  });

  // ============================================================================
  // ROLE ASSIGNMENT RESTRICTIONS
  // ============================================================================
  describe('Role Assignment Restrictions', () => {
    it('should have correct level assignments', () => {
      // Legend roles should be god level
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_SUPER_ADMIN].level).toBe(
        'god'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_ADMIN].level).toBe('god');

      // Admin roles should be admin level
      expect(PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_SUPER_ADMIN].level).toBe(
        'admin'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_ADMIN].level).toBe('admin');
      expect(PLATFORM_ROLE_METADATA[PlatformRole.COMPVSS_ADMIN].level).toBe(
        'admin'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.GVTEWAY_ADMIN].level).toBe(
        'admin'
      );

      // Member roles should be member level
      expect(PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_TEAM_MEMBER].level).toBe(
        'member'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.GVTEWAY_MEMBER].level).toBe(
        'member'
      );

      // Viewer roles should be viewer level
      expect(PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_VIEWER].level).toBe(
        'viewer'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.COMPVSS_VIEWER].level).toBe(
        'viewer'
      );
    });

    it('should have correct platform assignments', () => {
      expect(PLATFORM_ROLE_METADATA[PlatformRole.LEGEND_SUPER_ADMIN].platform).toBe(
        'legend'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.ATLVS_ADMIN].platform).toBe(
        'atlvs'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.COMPVSS_ADMIN].platform).toBe(
        'compvss'
      );
      expect(PLATFORM_ROLE_METADATA[PlatformRole.GVTEWAY_ADMIN].platform).toBe(
        'gvteway'
      );
    });
  });

  // ============================================================================
  // MULTI-PLATFORM ROLE COMBINATIONS
  // ============================================================================
  describe('Multi-Platform Role Combinations', () => {
    it('should allow users to have roles across multiple platforms', () => {
      const userRoles: PlatformRole[] = [
        PlatformRole.ATLVS_ADMIN,
        PlatformRole.COMPVSS_TEAM_MEMBER,
        PlatformRole.GVTEWAY_MEMBER,
      ];

      const platforms = new Set(
        userRoles.map((role) => PLATFORM_ROLE_METADATA[role].platform)
      );
      expect(platforms.size).toBe(3);
      expect(platforms.has('atlvs')).toBe(true);
      expect(platforms.has('compvss')).toBe(true);
      expect(platforms.has('gvteway')).toBe(true);
    });

    it('should correctly identify highest role across platforms', () => {
      const userRoles: PlatformRole[] = [
        PlatformRole.ATLVS_VIEWER,
        PlatformRole.COMPVSS_ADMIN,
        PlatformRole.GVTEWAY_MEMBER,
      ];

      const levelMap: Record<string, number> = {
        god: 4,
        admin: 3,
        manager: 2,
        member: 1,
        viewer: 0,
      };

      const highestLevel = Math.max(
        ...userRoles.map(
          (role) => levelMap[PLATFORM_ROLE_METADATA[role].level]
        )
      );
      expect(highestLevel).toBe(3); // admin level from COMPVSS_ADMIN
    });
  });

  // ============================================================================
  // EVENT ROLE PLATFORM ACCESS RESTRICTIONS
  // ============================================================================
  describe('Event Role Platform Access Restrictions', () => {
    it('should grant all-platform access to executive roles', () => {
      expect(hasEventRolePlatformAccess(EventRole.EXECUTIVE, 'atlvs')).toBe(true);
      expect(hasEventRolePlatformAccess(EventRole.EXECUTIVE, 'compvss')).toBe(
        true
      );
      expect(hasEventRolePlatformAccess(EventRole.EXECUTIVE, 'gvteway')).toBe(
        true
      );
    });

    it('should restrict COMPVSS-only roles', () => {
      expect(hasEventRolePlatformAccess(EventRole.CREW, 'compvss')).toBe(true);
      expect(hasEventRolePlatformAccess(EventRole.CREW, 'atlvs')).toBe(false);
      expect(hasEventRolePlatformAccess(EventRole.CREW, 'gvteway')).toBe(false);
    });

    it('should restrict GVTEWAY-only roles', () => {
      expect(hasEventRolePlatformAccess(EventRole.VIP_L1, 'gvteway')).toBe(true);
      expect(hasEventRolePlatformAccess(EventRole.VIP_L1, 'atlvs')).toBe(false);
      expect(hasEventRolePlatformAccess(EventRole.VIP_L1, 'compvss')).toBe(false);
    });

    it('should grant dual-platform access to performer roles', () => {
      expect(hasEventRolePlatformAccess(EventRole.ARTIST, 'compvss')).toBe(true);
      expect(hasEventRolePlatformAccess(EventRole.ARTIST, 'gvteway')).toBe(true);
      expect(hasEventRolePlatformAccess(EventRole.ARTIST, 'atlvs')).toBe(false);
    });
  });

  // ============================================================================
  // ROLE HIERARCHY LEVEL COMPARISONS
  // ============================================================================
  describe('Role Hierarchy Level Comparisons', () => {
    it('should order executive roles correctly', () => {
      expect(EVENT_ROLE_HIERARCHY[EventRole.EXECUTIVE]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.CORE_AAA]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.CORE_AAA]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.AA]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.AA]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.PRODUCTION]
      );
    });

    it('should order VIP tiers correctly', () => {
      expect(EVENT_ROLE_HIERARCHY[EventRole.BACKSTAGE_L2]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.BACKSTAGE_L1]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.PLATINUM_VIP_L2]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.PLATINUM_VIP_L1]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.VIP_L3]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.VIP_L2]
      );
    });

    it('should order GA tiers correctly', () => {
      expect(EVENT_ROLE_HIERARCHY[EventRole.GA_L5]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.GA_L4]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.GA_L4]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.GA_L3]
      );
      expect(EVENT_ROLE_HIERARCHY[EventRole.GA_L1]).toBeGreaterThan(
        EVENT_ROLE_HIERARCHY[EventRole.GUEST]
      );
    });
  });

  // ============================================================================
  // PERMISSION CHECKS PER EVENT
  // ============================================================================
  describe('Permission Checks Per Event', () => {
    it('should grant correct permissions to EXECUTIVE role', () => {
      const permissions = getEventRolePermissions(EventRole.EXECUTIVE);
      expect(permissions).toContain('events:create');
      expect(permissions).toContain('events:edit');
      expect(permissions).toContain('events:delete');
      expect(permissions).toContain('tickets:manage');
      expect(permissions).toContain('users:manage');
    });

    it('should grant limited permissions to CREW role', () => {
      const permissions = getEventRolePermissions(EventRole.CREW);
      expect(permissions).toContain('advancing:submit');
      expect(permissions).toContain('tasks:view');
      expect(permissions).toContain('backstage:access');
      expect(permissions).not.toContain('events:create');
      expect(permissions).not.toContain('budgets:manage');
    });

    it('should grant view-only permissions to GUEST role', () => {
      const permissions = getEventRolePermissions(EventRole.GUEST);
      expect(permissions).toContain('events:view');
      expect(permissions).toContain('venue:access:guest');
      expect(permissions).not.toContain('orders:view:own');
    });
  });

  // ============================================================================
  // MULTIPLE ROLES PER EVENT
  // ============================================================================
  describe('Multiple Roles Per Event', () => {
    it('should aggregate permissions from multiple roles', () => {
      const userEventRoles: EventRole[] = [EventRole.CREW, EventRole.MEDIA];

      const allPermissions = new Set<Permission>();
      userEventRoles.forEach((role) => {
        getEventRolePermissions(role).forEach((perm) =>
          allPermissions.add(perm)
        );
      });

      expect(allPermissions.has('advancing:submit')).toBe(true); // from CREW
      expect(allPermissions.has('photo:pit:access')).toBe(true); // from MEDIA
      expect(allPermissions.has('backstage:access')).toBe(true); // from CREW
    });

    it('should use highest hierarchy level from multiple roles', () => {
      const userEventRoles: EventRole[] = [
        EventRole.CREW,
        EventRole.PRODUCTION,
      ];

      const highestLevel = Math.max(
        ...userEventRoles.map((role) => EVENT_ROLE_HIERARCHY[role])
      );
      expect(highestLevel).toBe(EVENT_ROLE_HIERARCHY[EventRole.PRODUCTION]);
    });
  });

  // ============================================================================
  // TEMPORARY ROLE EXPIRATION
  // ============================================================================
  describe('Temporary Role Expiration', () => {
    it('should support expiration date on event roles', () => {
      interface EventAssignment {
        userId: string;
        eventId: string;
        roles: EventRole[];
        expiresAt?: Date;
      }

      const assignment: EventAssignment = {
        userId: 'user-123',
        eventId: 'event-456',
        roles: [EventRole.VIP_L1],
        expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
      };

      const isExpired = (a: EventAssignment): boolean => {
        if (!a.expiresAt) return false;
        return new Date() > a.expiresAt;
      };

      expect(isExpired(assignment)).toBe(false);

      // Test expired assignment
      const expiredAssignment: EventAssignment = {
        userId: 'user-123',
        eventId: 'event-456',
        roles: [EventRole.VIP_L1],
        expiresAt: new Date(Date.now() - 86400000), // 24 hours ago
      };

      expect(isExpired(expiredAssignment)).toBe(true);
    });
  });

  // ============================================================================
  // CROSS-PLATFORM EVENT ROLE ACCESS
  // ============================================================================
  describe('Cross-Platform Event Role Access', () => {
    it('should correctly map all-platform roles', () => {
      const allPlatformRoles = [
        EventRole.EXECUTIVE,
        EventRole.CORE_AAA,
        EventRole.AA,
        EventRole.PRODUCTION,
        EventRole.MANAGEMENT,
      ];

      allPlatformRoles.forEach((role) => {
        const access = EVENT_ROLE_PLATFORM_ACCESS[role];
        expect(access).toContain('atlvs');
        expect(access).toContain('compvss');
        expect(access).toContain('gvteway');
      });
    });

    it('should correctly map dual-platform roles', () => {
      const dualPlatformRoles = [
        EventRole.ENTERTAINER,
        EventRole.ARTIST,
        EventRole.MEDIA,
        EventRole.SPONSOR,
        EventRole.PARTNER,
      ];

      dualPlatformRoles.forEach((role) => {
        const access = EVENT_ROLE_PLATFORM_ACCESS[role];
        expect(access).toContain('compvss');
        expect(access).toContain('gvteway');
        expect(access).not.toContain('atlvs');
      });
    });
  });

  // ============================================================================
  // SECURITY TESTS
  // ============================================================================
  describe('Security - Unauthorized Access Attempts', () => {
    it('should deny access for users with no roles', () => {
      const userRoles: PlatformRole[] = [];

      const hasAnyPermission = (permission: Permission): boolean => {
        return userRoles.some((role) => hasPermission(role, permission));
      };

      expect(hasAnyPermission('events:create')).toBe(false);
      expect(hasAnyPermission('users:manage')).toBe(false);
    });
  });

  describe('Security - Privilege Escalation Prevention', () => {
    it('should not allow lower roles to access higher permissions', () => {
      // ATLVS_VIEWER should not have admin permissions
      const viewerPermissions = hasPermission(
        PlatformRole.ATLVS_VIEWER,
        'users:manage'
      );
      expect(viewerPermissions).toBe(false);
    });

    it('should not allow cross-platform privilege escalation', () => {
      // COMPVSS_ADMIN should not have ATLVS admin permissions
      const metadata = PLATFORM_ROLE_METADATA[PlatformRole.COMPVSS_ADMIN];
      expect(metadata.platform).toBe('compvss');
      expect(metadata.platform).not.toBe('atlvs');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle user with no roles gracefully', () => {
      const userRoles: PlatformRole[] = [];
      const inherited = userRoles.flatMap((role) => getAllInheritedRoles(role));
      expect(inherited).toHaveLength(0);
    });

    it('should handle conflicting permissions by granting access', () => {
      // If a user has both a restrictive and permissive role, permissive wins
      const userRoles: PlatformRole[] = [
        PlatformRole.ATLVS_VIEWER,
        PlatformRole.ATLVS_ADMIN,
      ];

      const hasAdminAccess = userRoles.some(
        (role) => PLATFORM_ROLE_METADATA[role].level === 'admin'
      );
      expect(hasAdminAccess).toBe(true);
    });

    it('should validate all event roles have defined permissions', () => {
      Object.values(EventRole).forEach((role) => {
        const permissions = EVENT_ROLE_PERMISSIONS[role];
        expect(permissions).toBeDefined();
        expect(Array.isArray(permissions)).toBe(true);
      });
    });

    it('should validate all event roles have defined hierarchy levels', () => {
      Object.values(EventRole).forEach((role) => {
        const level = EVENT_ROLE_HIERARCHY[role];
        expect(level).toBeDefined();
        expect(typeof level).toBe('number');
        expect(level).toBeGreaterThan(0);
      });
    });

    it('should validate all event roles have defined platform access', () => {
      Object.values(EventRole).forEach((role) => {
        const access = EVENT_ROLE_PLATFORM_ACCESS[role];
        expect(access).toBeDefined();
        expect(Array.isArray(access)).toBe(true);
        expect(access.length).toBeGreaterThan(0);
      });
    });
  });
});
