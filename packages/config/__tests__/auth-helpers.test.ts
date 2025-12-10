import { describe, it, expect } from 'vitest';
import { hasRole, isLegendUser, isAdmin, AuthUser } from '../auth-helpers';

describe('auth-helpers', () => {
  const createMockUser = (roles: string[]): AuthUser => ({
    id: 'user-123',
    email: 'test@example.com',
    platform_user_id: 'platform-123',
    organization_id: 'org-123',
    roles,
    current_role: roles[0] || '',
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      const user = createMockUser(['ATLVS_ADMIN', 'COMPVSS_VIEWER']);
      expect(hasRole(user, 'ATLVS_ADMIN')).toBe(true);
    });

    it('should return true when user has any of the specified roles', () => {
      const user = createMockUser(['ATLVS_VIEWER']);
      expect(hasRole(user, 'ATLVS_ADMIN', 'ATLVS_VIEWER')).toBe(true);
    });

    it('should return false when user does not have any of the specified roles', () => {
      const user = createMockUser(['ATLVS_VIEWER']);
      expect(hasRole(user, 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, 'ATLVS_ADMIN')).toBe(false);
    });

    it('should return false for user with empty roles', () => {
      const user = createMockUser([]);
      expect(hasRole(user, 'ATLVS_ADMIN')).toBe(false);
    });

    it('should handle multiple role checks', () => {
      const user = createMockUser(['GVTEWAY_MEMBER', 'COMPVSS_TEAM_MEMBER']);
      expect(hasRole(user, 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_MEMBER')).toBe(true);
    });
  });

  describe('isLegendUser', () => {
    it('should return true for LEGEND_SUPER_ADMIN', () => {
      const user = createMockUser(['LEGEND_SUPER_ADMIN']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return true for LEGEND_ADMIN', () => {
      const user = createMockUser(['LEGEND_ADMIN']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return true for LEGEND_DEVELOPER', () => {
      const user = createMockUser(['LEGEND_DEVELOPER']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return true for LEGEND_SUPPORT', () => {
      const user = createMockUser(['LEGEND_SUPPORT']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return true for LEGEND_INCOGNITO', () => {
      const user = createMockUser(['LEGEND_INCOGNITO']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return true when user has any Legend role among others', () => {
      const user = createMockUser(['ATLVS_ADMIN', 'LEGEND_COLLABORATOR', 'GVTEWAY_MEMBER']);
      expect(isLegendUser(user)).toBe(true);
    });

    it('should return false for non-Legend roles', () => {
      const user = createMockUser(['ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN']);
      expect(isLegendUser(user)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isLegendUser(null)).toBe(false);
    });

    it('should return false for user with empty roles', () => {
      const user = createMockUser([]);
      expect(isLegendUser(user)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ATLVS_ADMIN', () => {
      const user = createMockUser(['ATLVS_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for ATLVS_SUPER_ADMIN', () => {
      const user = createMockUser(['ATLVS_SUPER_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for COMPVSS_ADMIN', () => {
      const user = createMockUser(['COMPVSS_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for GVTEWAY_ADMIN', () => {
      const user = createMockUser(['GVTEWAY_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for LEGEND_ADMIN', () => {
      const user = createMockUser(['LEGEND_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true for LEGEND_SUPER_ADMIN', () => {
      const user = createMockUser(['LEGEND_SUPER_ADMIN']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return true when user has admin role among others', () => {
      const user = createMockUser(['ATLVS_VIEWER', 'COMPVSS_ADMIN', 'GVTEWAY_MEMBER']);
      expect(isAdmin(user)).toBe(true);
    });

    it('should return false for non-admin roles', () => {
      const user = createMockUser(['ATLVS_VIEWER', 'COMPVSS_TEAM_MEMBER', 'GVTEWAY_MEMBER']);
      expect(isAdmin(user)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('should return false for user with empty roles', () => {
      const user = createMockUser([]);
      expect(isAdmin(user)).toBe(false);
    });
  });
});
