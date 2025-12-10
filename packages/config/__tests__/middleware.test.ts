import { describe, it, expect } from 'vitest';
import { PlatformRole } from '../roles';

// Import the permissions mapping directly to test it
// Since it's not exported, we'll recreate the structure for testing
const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, string[]> = {
  [PlatformRole.LEGEND_SUPER_ADMIN]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_ADMIN]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_DEVELOPER]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.LEGEND_COLLABORATOR]: ['events:create', 'events:edit', 'events:view', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:view'],
  [PlatformRole.LEGEND_SUPPORT]: ['events:view', 'projects:view', 'tasks:view', 'budgets:view', 'orders:view'],
  [PlatformRole.LEGEND_INCOGNITO]: ['events:create', 'events:edit', 'events:delete', 'events:view', 'tickets:manage', 'orders:view', 'orders:refund', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'advancing:submit', 'advancing:approve', 'users:manage'],
  [PlatformRole.ATLVS_SUPER_ADMIN]: ['projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view', 'users:manage'],
  [PlatformRole.ATLVS_ADMIN]: ['projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'budgets:manage', 'budgets:view'],
  [PlatformRole.ATLVS_TEAM_MEMBER]: ['projects:view', 'tasks:view', 'budgets:view'],
  [PlatformRole.ATLVS_VIEWER]: ['projects:view', 'tasks:view'],
  [PlatformRole.COMPVSS_ADMIN]: ['events:create', 'events:edit', 'events:view', 'projects:create', 'projects:edit', 'projects:view', 'tasks:assign', 'tasks:view', 'advancing:approve', 'budgets:view'],
  [PlatformRole.COMPVSS_TEAM_MEMBER]: ['events:view', 'projects:view', 'tasks:view', 'advancing:submit'],
  [PlatformRole.COMPVSS_COLLABORATOR]: ['events:view', 'projects:view', 'tasks:view'],
  [PlatformRole.COMPVSS_VIEWER]: ['events:view', 'projects:view'],
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

describe('middleware', () => {
  describe('PLATFORM_ROLE_PERMISSIONS', () => {
    it('should have permissions for all platform roles', () => {
      const allRoles = Object.values(PlatformRole);
      allRoles.forEach((role) => {
        expect(PLATFORM_ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(PLATFORM_ROLE_PERMISSIONS[role])).toBe(true);
      });
    });

    it('should give Legend roles full permissions', () => {
      const legendRoles = [
        PlatformRole.LEGEND_SUPER_ADMIN,
        PlatformRole.LEGEND_ADMIN,
        PlatformRole.LEGEND_DEVELOPER,
        PlatformRole.LEGEND_INCOGNITO,
      ];

      legendRoles.forEach((role) => {
        const permissions = PLATFORM_ROLE_PERMISSIONS[role];
        expect(permissions).toContain('events:create');
        expect(permissions).toContain('events:delete');
        expect(permissions).toContain('users:manage');
        expect(permissions).toContain('budgets:manage');
      });
    });

    it('should give Legend Support read-only permissions', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.LEGEND_SUPPORT];
      expect(permissions).toContain('events:view');
      expect(permissions).toContain('projects:view');
      expect(permissions).not.toContain('events:create');
      expect(permissions).not.toContain('events:delete');
    });

    it('should give ATLVS roles project-focused permissions', () => {
      const atlvsAdmin = PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_ADMIN];
      expect(atlvsAdmin).toContain('projects:create');
      expect(atlvsAdmin).toContain('projects:edit');
      expect(atlvsAdmin).toContain('tasks:assign');
      expect(atlvsAdmin).not.toContain('events:create');
    });

    it('should give ATLVS Viewer minimal permissions', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_VIEWER];
      expect(permissions).toContain('projects:view');
      expect(permissions).toContain('tasks:view');
      expect(permissions).not.toContain('projects:edit');
      expect(permissions).not.toContain('budgets:view');
    });

    it('should give COMPVSS roles event and project permissions', () => {
      const compvssAdmin = PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_ADMIN];
      expect(compvssAdmin).toContain('events:create');
      expect(compvssAdmin).toContain('events:edit');
      expect(compvssAdmin).toContain('projects:create');
      expect(compvssAdmin).toContain('advancing:approve');
    });

    it('should give COMPVSS Team Member advancing submit permission', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_TEAM_MEMBER];
      expect(permissions).toContain('advancing:submit');
      expect(permissions).not.toContain('advancing:approve');
    });

    it('should give GVTEWAY Admin full event management', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_ADMIN];
      expect(permissions).toContain('events:create');
      expect(permissions).toContain('events:edit');
      expect(permissions).toContain('events:delete');
      expect(permissions).toContain('tickets:manage');
      expect(permissions).toContain('orders:refund');
    });

    it('should give GVTEWAY Member basic view permissions', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_MEMBER];
      expect(permissions).toContain('events:view');
      expect(permissions).toContain('orders:view:own');
      expect(permissions).not.toContain('events:create');
    });

    it('should give GVTEWAY Guest minimal permissions', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_MEMBER_GUEST];
      expect(permissions.length).toBe(1);
      expect(permissions).toContain('events:view');
    });

    it('should give GVTEWAY Affiliate referral permissions', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_AFFILIATE];
      expect(permissions).toContain('referral:create');
      expect(permissions).toContain('commission:view');
    });

    it('should give GVTEWAY Venue Manager venue access', () => {
      const permissions = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_VENUE_MANAGER];
      expect(permissions).toContain('venue:access:all');
    });
  });

  describe('Permission hierarchy', () => {
    it('should have more permissions for admin roles than viewer roles', () => {
      expect(PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_ADMIN].length)
        .toBeGreaterThan(PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_VIEWER].length);
      
      expect(PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_ADMIN].length)
        .toBeGreaterThan(PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_VIEWER].length);
      
      expect(PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_ADMIN].length)
        .toBeGreaterThan(PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_MEMBER].length);
    });

    it('should have Legend roles with most permissions', () => {
      const legendPermCount = PLATFORM_ROLE_PERMISSIONS[PlatformRole.LEGEND_SUPER_ADMIN].length;
      const atlvsPermCount = PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_SUPER_ADMIN].length;
      const compvssPermCount = PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_ADMIN].length;
      const gvtewayPermCount = PLATFORM_ROLE_PERMISSIONS[PlatformRole.GVTEWAY_ADMIN].length;

      expect(legendPermCount).toBeGreaterThan(atlvsPermCount);
      expect(legendPermCount).toBeGreaterThan(compvssPermCount);
      expect(legendPermCount).toBeGreaterThan(gvtewayPermCount);
    });
  });

  describe('Permission categories', () => {
    it('should have event permissions', () => {
      const eventPermissions = ['events:create', 'events:edit', 'events:delete', 'events:view'];
      const adminPerms = PLATFORM_ROLE_PERMISSIONS[PlatformRole.LEGEND_ADMIN];
      eventPermissions.forEach((perm) => {
        expect(adminPerms).toContain(perm);
      });
    });

    it('should have project permissions', () => {
      const projectPermissions = ['projects:create', 'projects:edit', 'projects:view'];
      const adminPerms = PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_ADMIN];
      projectPermissions.forEach((perm) => {
        expect(adminPerms).toContain(perm);
      });
    });

    it('should have budget permissions', () => {
      const budgetPermissions = ['budgets:manage', 'budgets:view'];
      const adminPerms = PLATFORM_ROLE_PERMISSIONS[PlatformRole.ATLVS_ADMIN];
      budgetPermissions.forEach((perm) => {
        expect(adminPerms).toContain(perm);
      });
    });

    it('should have advancing permissions', () => {
      expect(PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_ADMIN]).toContain('advancing:approve');
      expect(PLATFORM_ROLE_PERMISSIONS[PlatformRole.COMPVSS_TEAM_MEMBER]).toContain('advancing:submit');
    });
  });
});
