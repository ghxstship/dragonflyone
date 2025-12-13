/**
 * Gap 2 Remediation: Portal Access Client Functions
 * TypeScript client for portal user data isolation
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type PortalEntityType = 'vendor' | 'sponsor' | 'investor' | 'artist' | 'crew';
export type PortalAccessLevel = 'read' | 'write' | 'admin';

export interface PortalAccessGrant {
  userId: string;
  entityType: PortalEntityType;
  entityId: string;
  accessLevel: PortalAccessLevel;
  expiresAt?: Date;
  notes?: string;
}

export interface PortalAccessRecord {
  id: string;
  userId: string;
  entityType: PortalEntityType;
  entityId: string;
  accessLevel: PortalAccessLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  notes: string | null;
}

export interface PortalAccessCheckResult {
  hasAccess: boolean;
  accessLevel: PortalAccessLevel | null;
  entityId: string | null;
  expiresAt: Date | null;
}

// ============================================================================
// PORTAL ACCESS CLIENT
// ============================================================================

export class PortalAccessClient {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Grant portal access to a user
   */
  async grantAccess(grant: PortalAccessGrant): Promise<{ success: boolean; error?: string; id?: string }> {
    const { data, error } = await this.supabase.rpc('grant_portal_access', {
      p_user_id: grant.userId,
      p_entity_type: grant.entityType,
      p_entity_id: grant.entityId,
      p_access_level: grant.accessLevel,
      p_expires_at: grant.expiresAt?.toISOString() || null,
      p_notes: grant.notes || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data as string };
  }

  /**
   * Revoke portal access from a user
   */
  async revokeAccess(
    userId: string,
    entityType: PortalEntityType,
    entityId: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase.rpc('revoke_portal_access', {
      p_user_id: userId,
      p_entity_type: entityType,
      p_entity_id: entityId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Check if a user has access to a specific entity
   */
  async checkAccess(
    userId: string,
    entityType: PortalEntityType,
    entityId: string
  ): Promise<PortalAccessCheckResult> {
    const { data, error } = await this.supabase.rpc('has_portal_entity_access', {
      p_user_id: userId,
      p_entity_type: entityType,
      p_entity_id: entityId,
    });

    if (error || !data) {
      return {
        hasAccess: false,
        accessLevel: null,
        entityId: null,
        expiresAt: null,
      };
    }

    return {
      hasAccess: true,
      accessLevel: data.access_level as PortalAccessLevel,
      entityId: data.entity_id as string,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    };
  }

  /**
   * Get all portal access records for a user
   */
  async getUserAccess(userId: string): Promise<PortalAccessRecord[]> {
    const { data, error } = await this.supabase
      .from('portal_user_entity_access')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error || !data) {
      return [];
    }

    return data.map(record => ({
      id: record.id,
      userId: record.user_id,
      entityType: record.entity_type as PortalEntityType,
      entityId: record.entity_id,
      accessLevel: record.access_level as PortalAccessLevel,
      grantedBy: record.granted_by,
      grantedAt: new Date(record.granted_at),
      expiresAt: record.expires_at ? new Date(record.expires_at) : null,
      revokedAt: record.revoked_at ? new Date(record.revoked_at) : null,
      notes: record.notes,
    }));
  }

  /**
   * Get all users with access to a specific entity
   */
  async getEntityUsers(
    entityType: PortalEntityType,
    entityId: string
  ): Promise<Array<{ userId: string; email: string; accessLevel: PortalAccessLevel; grantedAt: Date }>> {
    const { data, error } = await this.supabase
      .from('portal_user_entity_access')
      .select(`
        user_id,
        access_level,
        granted_at,
        platform_users!inner(email)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('revoked_at', null)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error || !data) {
      return [];
    }

    return data.map(record => {
      const platformUsers = record.platform_users as unknown as { email: string } | null;
      return {
        userId: record.user_id,
        email: platformUsers?.email || '',
        accessLevel: record.access_level as PortalAccessLevel,
        grantedAt: new Date(record.granted_at),
      };
    });
  }

  /**
   * Update access level for existing grant
   */
  async updateAccessLevel(
    userId: string,
    entityType: PortalEntityType,
    entityId: string,
    newAccessLevel: PortalAccessLevel
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('portal_user_entity_access')
      .update({
        access_level: newAccessLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('revoked_at', null);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Extend expiration for existing grant
   */
  async extendAccess(
    userId: string,
    entityType: PortalEntityType,
    entityId: string,
    newExpiresAt: Date
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await this.supabase
      .from('portal_user_entity_access')
      .update({
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('revoked_at', null);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Bulk grant access to multiple users
   */
  async bulkGrantAccess(
    grants: PortalAccessGrant[]
  ): Promise<{ success: boolean; results: Array<{ userId: string; success: boolean; error?: string }> }> {
    const results = await Promise.all(
      grants.map(async grant => {
        const result = await this.grantAccess(grant);
        return {
          userId: grant.userId,
          success: result.success,
          error: result.error,
        };
      })
    );

    return {
      success: results.every(r => r.success),
      results,
    };
  }

  /**
   * Get access audit log for an entity
   */
  async getAccessAuditLog(
    entityType: PortalEntityType,
    entityId: string,
    limit: number = 50
  ): Promise<Array<{
    action: 'granted' | 'revoked' | 'updated';
    userId: string;
    userEmail: string;
    performedBy: string;
    performedAt: Date;
    details: Record<string, unknown>;
  }>> {
    const { data, error } = await this.supabase
      .from('permission_audit_log')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(record => ({
      action: record.action_type.includes('grant') ? 'granted' : 
              record.action_type.includes('revoke') ? 'revoked' : 'updated',
      userId: record.target_user_id,
      userEmail: record.target_user_email || '',
      performedBy: record.performed_by_email || '',
      performedAt: new Date(record.created_at),
      details: record.metadata || {},
    }));
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createPortalAccessClient(supabase: SupabaseClient): PortalAccessClient {
  return new PortalAccessClient(supabase);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user can perform action based on access level
 */
export function canPerformAction(
  accessLevel: PortalAccessLevel,
  action: 'read' | 'write' | 'delete' | 'admin'
): boolean {
  const levelHierarchy: Record<PortalAccessLevel, number> = {
    read: 1,
    write: 2,
    admin: 3,
  };

  const actionRequirements: Record<string, number> = {
    read: 1,
    write: 2,
    delete: 3,
    admin: 3,
  };

  return levelHierarchy[accessLevel] >= actionRequirements[action];
}

/**
 * Get display name for entity type
 */
export function getEntityTypeDisplayName(entityType: PortalEntityType): string {
  const names: Record<PortalEntityType, string> = {
    vendor: 'Vendor',
    sponsor: 'Sponsor',
    investor: 'Investor',
    artist: 'Artist',
    crew: 'Crew Member',
  };
  return names[entityType];
}

/**
 * Get display name for access level
 */
export function getAccessLevelDisplayName(accessLevel: PortalAccessLevel): string {
  const names: Record<PortalAccessLevel, string> = {
    read: 'Read Only',
    write: 'Read & Write',
    admin: 'Full Admin',
  };
  return names[accessLevel];
}
