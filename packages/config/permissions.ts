/**
 * Detailed ResourcePermission System
 * Resource-level permissions with caching and management
 */

// =============================================================================
// TYPES
// =============================================================================

export type ResourcePermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export' | 'import' | 'approve';

export type ResourceType =
  | 'productions'
  | 'events'
  | 'shows'
  | 'venues'
  | 'crew'
  | 'schedules'
  | 'budgets'
  | 'expenses'
  | 'invoices'
  | 'sponsors'
  | 'investors'
  | 'contracts'
  | 'documents'
  | 'assets'
  | 'equipment'
  | 'tickets'
  | 'guests'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'users'
  | 'roles'
  | 'integrations'
  | 'api_keys'
  | 'webhooks'
  | 'sso'
  | 'audit_logs';

export interface ResourcePermission {
  /** Resource type */
  resource: ResourceType;
  /** Allowed actions */
  actions: ResourcePermissionAction[];
  /** Optional resource ID for instance-level permissions */
  resourceId?: string;
  /** Conditions for the permission */
  conditions?: ResourcePermissionCondition[];
}

export interface ResourcePermissionCondition {
  /** Field to check */
  field: string;
  /** Operator */
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  /** Value to compare */
  value: unknown;
}

export interface ResourcePermissionGrant {
  /** Grant ID */
  id: string;
  /** User or role ID */
  granteeId: string;
  /** Grantee type */
  granteeType: 'user' | 'role';
  /** ResourcePermission */
  permission: ResourcePermission;
  /** Organization scope */
  organizationId: string;
  /** Production scope (optional) */
  productionId?: string;
  /** Granted by */
  grantedBy: string;
  /** Grant timestamp */
  grantedAt: Date;
  /** Expiry (optional) */
  expiresAt?: Date;
}

export interface ResourcePermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matchedGrant?: ResourcePermissionGrant;
}

// =============================================================================
// PERMISSION MATRIX
// =============================================================================

/**
 * Default permissions for each role
 */
export const ROLE_PERMISSION_MATRIX: Record<string, ResourcePermission[]> = {
  // Super Admin - Full access
  LEGEND_SUPER_ADMIN: [
    { resource: 'productions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'events', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'shows', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'venues', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'crew', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'schedules', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'budgets', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'sponsors', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'investors', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'contracts', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'manage', 'export'] },
    { resource: 'assets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'equipment', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'tickets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'guests', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'api_keys', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'webhooks', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'sso', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'audit_logs', actions: ['read', 'export'] },
  ],
  
  // Organization Admin
  ATLVS_ADMIN: [
    { resource: 'productions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'events', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'shows', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'venues', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'crew', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'schedules', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'budgets', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'sponsors', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'investors', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'contracts', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'manage', 'export'] },
    { resource: 'assets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'equipment', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'tickets', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'guests', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export'] },
    { resource: 'analytics', actions: ['read', 'export'] },
    { resource: 'settings', actions: ['read', 'update', 'manage'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'roles', actions: ['read', 'update'] },
    { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
    { resource: 'api_keys', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'webhooks', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'sso', actions: ['read', 'update', 'manage'] },
    { resource: 'audit_logs', actions: ['read'] },
  ],
  
  // Production Manager
  ATLVS_PRODUCTION_MANAGER: [
    { resource: 'productions', actions: ['read', 'update'] },
    { resource: 'events', actions: ['create', 'read', 'update'] },
    { resource: 'shows', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'venues', actions: ['read', 'update'] },
    { resource: 'crew', actions: ['create', 'read', 'update'] },
    { resource: 'schedules', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'budgets', actions: ['read'] },
    { resource: 'expenses', actions: ['create', 'read'] },
    { resource: 'documents', actions: ['create', 'read', 'update'] },
    { resource: 'assets', actions: ['read', 'update'] },
    { resource: 'equipment', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['create', 'read'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  
  // Finance Manager
  ATLVS_FINANCE_MANAGER: [
    { resource: 'productions', actions: ['read'] },
    { resource: 'budgets', actions: ['create', 'read', 'update', 'delete', 'approve'] },
    { resource: 'expenses', actions: ['create', 'read', 'update', 'delete', 'approve'] },
    { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'approve'] },
    { resource: 'sponsors', actions: ['read', 'update'] },
    { resource: 'investors', actions: ['read', 'update'] },
    { resource: 'contracts', actions: ['read', 'update'] },
    { resource: 'reports', actions: ['create', 'read', 'export'] },
    { resource: 'analytics', actions: ['read', 'export'] },
  ],
  
  // Crew Member
  COMPVSS_CREW_MEMBER: [
    { resource: 'productions', actions: ['read'] },
    { resource: 'shows', actions: ['read'] },
    { resource: 'schedules', actions: ['read'] },
    { resource: 'documents', actions: ['read'] },
    { resource: 'equipment', actions: ['read'] },
  ],
  
  // Guest/Fan
  GVTEWAY_GUEST: [
    { resource: 'events', actions: ['read'] },
    { resource: 'shows', actions: ['read'] },
    { resource: 'tickets', actions: ['read'] },
  ],
};

// =============================================================================
// PERMISSION CACHE
// =============================================================================

interface CacheEntry {
  permissions: ResourcePermission[];
  timestamp: number;
  expiresAt: number;
}

const permissionCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cache key for user permissions
 */
function getCacheKey(userId: string, organizationId: string, productionId?: string): string {
  return `${userId}:${organizationId}:${productionId || 'global'}`;
}

/**
 * Get cached permissions
 */
export function getCachedResourcePermissions(
  userId: string,
  organizationId: string,
  productionId?: string
): ResourcePermission[] | null {
  const key = getCacheKey(userId, organizationId, productionId);
  const entry = permissionCache.get(key);
  
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    permissionCache.delete(key);
    return null;
  }
  
  return entry.permissions;
}

/**
 * Set cached permissions
 */
export function setCachedResourcePermissions(
  userId: string,
  organizationId: string,
  permissions: ResourcePermission[],
  productionId?: string
): void {
  const key = getCacheKey(userId, organizationId, productionId);
  permissionCache.set(key, {
    permissions,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/**
 * Invalidate cached permissions for a user
 */
export function invalidateResourcePermissionCache(userId: string, organizationId?: string): void {
  if (organizationId) {
    // Invalidate specific org
    Array.from(permissionCache.keys()).forEach(key => {
      if (key.startsWith(`${userId}:${organizationId}`)) {
        permissionCache.delete(key);
      }
    });
  } else {
    // Invalidate all for user
    Array.from(permissionCache.keys()).forEach(key => {
      if (key.startsWith(`${userId}:`)) {
        permissionCache.delete(key);
      }
    });
  }
}

/**
 * Clear entire permission cache
 */
export function clearResourcePermissionCache(): void {
  permissionCache.clear();
}

// =============================================================================
// PERMISSION CHECKING
// =============================================================================

/**
 * Check if user has permission for an action on a resource
 */
export function checkResourcePermission(
  userResourcePermissions: ResourcePermission[],
  resource: ResourceType,
  action: ResourcePermissionAction,
  resourceId?: string,
  context?: Record<string, unknown>
): ResourcePermissionCheckResult {
  // Find matching permissions
  const matchingResourcePermissions = userResourcePermissions.filter(p => {
    // Check resource match
    if (p.resource !== resource) return false;
    
    // Check action match
    if (!p.actions.includes(action) && !p.actions.includes('manage')) return false;
    
    // Check resource ID if specified
    if (p.resourceId && resourceId && p.resourceId !== resourceId) return false;
    
    // Check conditions
    if (p.conditions && context) {
      for (const condition of p.conditions) {
        if (!evaluateCondition(condition, context)) return false;
      }
    }
    
    return true;
  });
  
  if (matchingResourcePermissions.length > 0) {
    return {
      allowed: true,
      matchedGrant: undefined, // Would need grant info from DB
    };
  }
  
  return {
    allowed: false,
    reason: `No permission for ${action} on ${resource}`,
  };
}

/**
 * Evaluate a permission condition
 */
function evaluateCondition(condition: ResourcePermissionCondition, context: Record<string, unknown>): boolean {
  const fieldValue = context[condition.field];
  const conditionValue = condition.value;
  
  switch (condition.operator) {
    case 'eq':
      return fieldValue === conditionValue;
    case 'neq':
      return fieldValue !== conditionValue;
    case 'in':
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
    case 'nin':
      return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue);
    case 'gt':
      return typeof fieldValue === 'number' && typeof conditionValue === 'number' && fieldValue > conditionValue;
    case 'gte':
      return typeof fieldValue === 'number' && typeof conditionValue === 'number' && fieldValue >= conditionValue;
    case 'lt':
      return typeof fieldValue === 'number' && typeof conditionValue === 'number' && fieldValue < conditionValue;
    case 'lte':
      return typeof fieldValue === 'number' && typeof conditionValue === 'number' && fieldValue <= conditionValue;
    case 'contains':
      return typeof fieldValue === 'string' && typeof conditionValue === 'string' && fieldValue.includes(conditionValue);
    default:
      return false;
  }
}

/**
 * Get permissions for a role
 */
export function getResourcePermissionsForRole(role: string): ResourcePermission[] {
  return ROLE_PERMISSION_MATRIX[role] || [];
}

/**
 * Merge permissions from multiple roles
 */
export function mergeResourcePermissions(roles: string[]): ResourcePermission[] {
  const permissionMap = new Map<string, ResourcePermission>();
  
  for (const role of roles) {
    const roleResourcePermissions = getResourcePermissionsForRole(role);
    
    for (const permission of roleResourcePermissions) {
      const key = `${permission.resource}:${permission.resourceId || 'all'}`;
      const existing = permissionMap.get(key);
      
      if (existing) {
        // Merge actions
        const mergedActions = new Set([...existing.actions, ...permission.actions]);
        permissionMap.set(key, {
          ...existing,
          actions: Array.from(mergedActions) as ResourcePermissionAction[],
        });
      } else {
        permissionMap.set(key, { ...permission });
      }
    }
  }
  
  return Array.from(permissionMap.values());
}

/**
 * Check if user can perform any of the specified actions
 */
export function canPerformAny(
  userResourcePermissions: ResourcePermission[],
  resource: ResourceType,
  actions: ResourcePermissionAction[]
): boolean {
  return actions.some(action => 
    checkResourcePermission(userResourcePermissions, resource, action).allowed
  );
}

/**
 * Check if user can perform all of the specified actions
 */
export function canPerformAll(
  userResourcePermissions: ResourcePermission[],
  resource: ResourceType,
  actions: ResourcePermissionAction[]
): boolean {
  return actions.every(action => 
    checkResourcePermission(userResourcePermissions, resource, action).allowed
  );
}

/**
 * Get all resources user has access to
 */
export function getAccessibleResources(userResourcePermissions: ResourcePermission[]): ResourceType[] {
  const resources = new Set<ResourceType>();
  
  for (const permission of userResourcePermissions) {
    if (permission.actions.length > 0) {
      resources.add(permission.resource);
    }
  }
  
  return Array.from(resources);
}

/**
 * Get all actions user can perform on a resource
 */
export function getActionsForResource(
  userResourcePermissions: ResourcePermission[],
  resource: ResourceType
): ResourcePermissionAction[] {
  const actions = new Set<ResourcePermissionAction>();
  
  for (const permission of userResourcePermissions) {
    if (permission.resource === resource) {
      permission.actions.forEach(action => actions.add(action));
    }
  }
  
  return Array.from(actions);
}
