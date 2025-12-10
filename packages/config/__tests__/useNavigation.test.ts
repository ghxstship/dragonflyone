import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  usePermissions,
  useNavigationAccess,
  useNavigationContext,
  useAppAccess,
  type UserRoleContext,
  type NavigationContext,
  type NavItem,
} from '../hooks/useNavigation';
import { PlatformRole, EventRole } from '../roles';

describe('useNavigation', () => {
  describe('usePermissions', () => {
    it('should return all permissions for Legend roles', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.LEGEND_SUPER_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() => usePermissions(userContext));

      expect(result.current.hasPermission('events:create')).toBe(true);
      expect(result.current.hasAnyPermission(['events:view'])).toBe(true);
      expect(result.current.hasAllPermissions(['users:manage', 'budgets:manage'])).toBe(true);
    });

    it('should return limited permissions for non-Legend roles', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_VIEWER,
        permissions: ['events:view'],
      };

      const { result } = renderHook(() => usePermissions(userContext));

      expect(result.current.hasPermission('events:view')).toBe(true);
      expect(result.current.hasPermission('events:create')).toBe(false);
    });

    it('should include event role permissions', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_TEAM_MEMBER,
        currentEventRole: EventRole.PRODUCTION,
        permissions: [],
      };

      const { result } = renderHook(() => usePermissions(userContext));

      // Production role should have some permissions
      expect(result.current.permissions.length).toBeGreaterThan(0);
    });

    it('should combine explicit and role-based permissions', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_TEAM_MEMBER,
        currentEventRole: EventRole.CREW,
        permissions: ['events:view'],
      };

      const { result } = renderHook(() => usePermissions(userContext));

      expect(result.current.hasPermission('events:view')).toBe(true);
    });
  });

  describe('useNavigationAccess', () => {
    const platformContext: NavigationContext = {
      level: 'platform',
      app: 'atlvs',
    };

    const eventContext: NavigationContext = {
      level: 'event',
      app: 'atlvs',
      productionId: 'prod-123',
    };

    it('should allow Legend roles to access all sections', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.LEGEND_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() =>
        useNavigationAccess(userContext, platformContext)
      );

      expect(result.current.canAccessSection('dashboard')).toBe(true);
      expect(result.current.canAccessSection('finance')).toBe(true);
      expect(result.current.canAccessSection('settings')).toBe(true);
    });

    it('should restrict admin sections for viewers', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_VIEWER,
        permissions: [],
      };

      const { result } = renderHook(() =>
        useNavigationAccess(userContext, platformContext)
      );

      expect(result.current.canAccessSection('dashboard')).toBe(true);
      expect(result.current.canAccessSection('finance')).toBe(false);
      expect(result.current.canAccessSection('organization')).toBe(false);
    });

    it('should check event-level access with event role', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_TEAM_MEMBER,
        currentEventRole: EventRole.PRODUCTION,
        permissions: [],
      };

      const { result } = renderHook(() =>
        useNavigationAccess(userContext, eventContext)
      );

      expect(result.current.canAccessSection('overview')).toBe(true);
      expect(result.current.canAccessSection('planning')).toBe(true);
    });

    describe('canAccessItem', () => {
      it('should allow access to items matching context level', () => {
        const userContext: UserRoleContext = {
          platformRole: PlatformRole.ATLVS_ADMIN,
          permissions: [],
        };

        const { result } = renderHook(() =>
          useNavigationAccess(userContext, platformContext)
        );

        const item: NavItem = {
          id: 'test',
          label: 'Test',
          contextLevel: 'platform',
        };

        expect(result.current.canAccessItem(item)).toBe(true);
      });

      it('should deny access to items with wrong context level', () => {
        const userContext: UserRoleContext = {
          platformRole: PlatformRole.ATLVS_ADMIN,
          permissions: [],
        };

        const { result } = renderHook(() =>
          useNavigationAccess(userContext, platformContext)
        );

        const item: NavItem = {
          id: 'test',
          label: 'Test',
          contextLevel: 'event',
        };

        expect(result.current.canAccessItem(item)).toBe(false);
      });

      it('should allow access to items with "both" context level', () => {
        const userContext: UserRoleContext = {
          platformRole: PlatformRole.ATLVS_ADMIN,
          permissions: [],
        };

        const { result } = renderHook(() =>
          useNavigationAccess(userContext, platformContext)
        );

        const item: NavItem = {
          id: 'test',
          label: 'Test',
          contextLevel: 'both',
        };

        expect(result.current.canAccessItem(item)).toBe(true);
      });

      it('should check app restrictions', () => {
        const userContext: UserRoleContext = {
          platformRole: PlatformRole.ATLVS_ADMIN,
          permissions: [],
        };

        const { result } = renderHook(() =>
          useNavigationAccess(userContext, platformContext)
        );

        const atlvsItem: NavItem = {
          id: 'atlvs-only',
          label: 'ATLVS Only',
          contextLevel: 'platform',
          apps: ['atlvs'],
        };

        const compvssItem: NavItem = {
          id: 'compvss-only',
          label: 'COMPVSS Only',
          contextLevel: 'platform',
          apps: ['compvss'],
        };

        expect(result.current.canAccessItem(atlvsItem)).toBe(true);
        expect(result.current.canAccessItem(compvssItem)).toBe(false);
      });
    });
  });

  describe('useNavigationContext', () => {
    it('should generate correct event context paths', () => {
      const context: NavigationContext = {
        level: 'event',
        app: 'atlvs',
        productionId: 'prod-123',
      };

      const { result } = renderHook(() => useNavigationContext(context));

      expect(result.current.getContextPath(context, '/schedule')).toBe('/p/prod-123/schedule');
    });

    it('should generate correct gvteway event paths', () => {
      const context: NavigationContext = {
        level: 'event',
        app: 'gvteway',
        eventId: 'event-456',
      };

      const { result } = renderHook(() => useNavigationContext(context));

      expect(result.current.getContextPath(context, '/tickets')).toBe('/e/event-456/tickets');
    });

    it('should return plain path for platform level', () => {
      const context: NavigationContext = {
        level: 'platform',
        app: 'atlvs',
      };

      const { result } = renderHook(() => useNavigationContext(context));

      expect(result.current.getContextPath(context, '/dashboard')).toBe('/dashboard');
    });

    it('should detect event context correctly', () => {
      const eventContext: NavigationContext = {
        level: 'event',
        app: 'atlvs',
        productionId: 'prod-123',
      };

      const platformContext: NavigationContext = {
        level: 'platform',
        app: 'atlvs',
      };

      const { result } = renderHook(() => useNavigationContext(eventContext));

      expect(result.current.isInEventContext(eventContext)).toBe(true);
      expect(result.current.isInEventContext(platformContext)).toBe(false);
    });

    it('should return platform path', () => {
      const context: NavigationContext = {
        level: 'platform',
        app: 'atlvs',
      };

      const { result } = renderHook(() => useNavigationContext(context));

      expect(result.current.getPlatformPath()).toBe('/dashboard');
    });
  });

  describe('useAppAccess', () => {
    it('should allow Legend roles to access all apps', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.LEGEND_SUPER_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() => useAppAccess(userContext));

      expect(result.current.canAccessAtlvs).toBe(true);
      expect(result.current.canAccessCompvss).toBe(true);
      expect(result.current.canAccessGvteway).toBe(true);
    });

    it('should restrict ATLVS users to ATLVS app', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() => useAppAccess(userContext));

      expect(result.current.canAccessAtlvs).toBe(true);
      expect(result.current.canAccessCompvss).toBe(false);
      expect(result.current.canAccessGvteway).toBe(false);
    });

    it('should restrict COMPVSS users to COMPVSS app', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.COMPVSS_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() => useAppAccess(userContext));

      expect(result.current.canAccessAtlvs).toBe(false);
      expect(result.current.canAccessCompvss).toBe(true);
      expect(result.current.canAccessGvteway).toBe(false);
    });

    it('should allow event role platform access', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.ATLVS_TEAM_MEMBER,
        currentEventRole: EventRole.PRODUCTION,
        permissions: [],
      };

      const { result } = renderHook(() => useAppAccess(userContext));

      // Production role should have access to ATLVS at minimum
      expect(result.current.canAccessAtlvs).toBe(true);
    });

    it('should provide canAccessApp function', () => {
      const userContext: UserRoleContext = {
        platformRole: PlatformRole.LEGEND_ADMIN,
        permissions: [],
      };

      const { result } = renderHook(() => useAppAccess(userContext));

      expect(result.current.canAccessApp('atlvs')).toBe(true);
      expect(result.current.canAccessApp('compvss')).toBe(true);
      expect(result.current.canAccessApp('gvteway')).toBe(true);
    });
  });
});
