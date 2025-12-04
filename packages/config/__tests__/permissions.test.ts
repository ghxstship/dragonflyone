import { describe, it, expect } from 'vitest';
import {
  ROLE_PERMISSION_MATRIX,
  getResourcePermissionsForRole,
  checkResourcePermission,
  mergeResourcePermissions,
  getAccessibleResources,
  type ResourceType,
} from '../permissions';

describe('Permissions', () => {
  describe('ROLE_PERMISSION_MATRIX', () => {
    it('should have permissions for LEGEND_SUPER_ADMIN', () => {
      expect(ROLE_PERMISSION_MATRIX.LEGEND_SUPER_ADMIN).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSION_MATRIX.LEGEND_SUPER_ADMIN)).toBe(true);
    });

    it('should have permissions for LEGEND_ORG_ADMIN', () => {
      expect(ROLE_PERMISSION_MATRIX.LEGEND_ORG_ADMIN).toBeDefined();
    });

    it('should have super_admin with full access to productions', () => {
      const superAdminPerms = ROLE_PERMISSION_MATRIX.LEGEND_SUPER_ADMIN;
      const productionPerm = superAdminPerms.find(p => p.resource === 'productions');
      expect(productionPerm).toBeDefined();
      expect(productionPerm?.actions).toContain('create');
      expect(productionPerm?.actions).toContain('delete');
      expect(productionPerm?.actions).toContain('manage');
    });
  });

  describe('checkResourcePermission', () => {
    it('should return allowed for super_admin on any resource', () => {
      const perms = ROLE_PERMISSION_MATRIX.LEGEND_SUPER_ADMIN;
      const result = checkResourcePermission(perms, 'productions', 'create');
      expect(result.allowed).toBe(true);
    });

    it('should return not allowed for crew member on user management', () => {
      const perms = ROLE_PERMISSION_MATRIX.LEGEND_CREW_MEMBER;
      const result = checkResourcePermission(perms, 'users', 'delete');
      expect(result.allowed).toBe(false);
    });

    it('should allow crew member to read schedules', () => {
      const perms = ROLE_PERMISSION_MATRIX.LEGEND_CREW_MEMBER;
      const result = checkResourcePermission(perms, 'schedules', 'read');
      expect(result.allowed).toBe(true);
    });
  });

  describe('getResourcePermissionsForRole', () => {
    it('should return permissions array for valid role', () => {
      const perms = getResourcePermissionsForRole('LEGEND_SUPER_ADMIN');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid role', () => {
      const perms = getResourcePermissionsForRole('invalid_role');
      expect(perms).toEqual([]);
    });
  });

  describe('mergeResourcePermissions', () => {
    it('should merge permissions from multiple roles', () => {
      const merged = mergeResourcePermissions(['LEGEND_CREW_MEMBER', 'LEGEND_FINANCE_MANAGER']);
      expect(Array.isArray(merged)).toBe(true);
      expect(merged.length).toBeGreaterThan(0);
    });

    it('should handle empty roles array', () => {
      const merged = mergeResourcePermissions([]);
      expect(merged).toEqual([]);
    });
  });

  describe('getAccessibleResources', () => {
    it('should return all resources for super admin', () => {
      const perms = ROLE_PERMISSION_MATRIX.LEGEND_SUPER_ADMIN;
      const resources = getAccessibleResources(perms);
      expect(resources).toContain('productions' as ResourceType);
      expect(resources).toContain('users' as ResourceType);
    });

    it('should return limited resources for crew member', () => {
      const perms = ROLE_PERMISSION_MATRIX.LEGEND_CREW_MEMBER;
      const resources = getAccessibleResources(perms);
      expect(resources).toContain('schedules' as ResourceType);
    });
  });
});
