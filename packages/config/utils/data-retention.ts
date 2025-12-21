/**
 * Data Retention Utilities
 * 
 * Implements automated data retention policy enforcement for GDPR compliance.
 * Handles data lifecycle management, anonymization, and deletion.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface RetentionPolicy {
  id: string;
  tableName: string;
  retentionDays: number;
  deletionStrategy: 'hard_delete' | 'soft_delete' | 'anonymize';
  conditions?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionResult {
  tableName: string;
  recordsProcessed: number;
  recordsDeleted: number;
  recordsAnonymized: number;
  errors: string[];
  executedAt: string;
}

/**
 * Default retention policies for GHXSTSHIP platform
 * Based on GDPR requirements and business needs
 */
export const defaultRetentionPolicies: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    tableName: 'audit_logs',
    retentionDays: 1095, // 3 years for compliance
    deletionStrategy: 'hard_delete',
    isActive: true,
  },
  {
    tableName: 'login_attempts',
    retentionDays: 90, // 90 days for security analysis
    deletionStrategy: 'hard_delete',
    isActive: true,
  },
  {
    tableName: 'user_sessions',
    retentionDays: 30, // 30 days after last activity
    deletionStrategy: 'hard_delete',
    isActive: true,
  },
  {
    tableName: 'notifications',
    retentionDays: 365, // 1 year
    deletionStrategy: 'hard_delete',
    conditions: { read_at: 'NOT NULL' }, // Only delete read notifications
    isActive: true,
  },
  {
    tableName: 'security_events',
    retentionDays: 1095, // 3 years for compliance
    deletionStrategy: 'hard_delete',
    isActive: true,
  },
  {
    tableName: 'data_subject_requests',
    retentionDays: 1825, // 5 years for legal compliance
    deletionStrategy: 'anonymize',
    conditions: { status: 'completed' },
    isActive: true,
  },
  {
    tableName: 'consent_records',
    retentionDays: 1825, // 5 years - proof of consent
    deletionStrategy: 'anonymize',
    isActive: true,
  },
  {
    tableName: 'cookie_consent',
    retentionDays: 365, // 1 year
    deletionStrategy: 'hard_delete',
    isActive: true,
  },
];

/**
 * Fields to anonymize for each table when using anonymization strategy
 */
const anonymizationFields: Record<string, string[]> = {
  platform_users: ['email', 'full_name', 'phone', 'avatar_url'],
  data_subject_requests: ['email', 'description', 'notes'],
  consent_records: ['ip_address', 'user_agent'],
  audit_logs: ['ip_address', 'user_agent'],
};

/**
 * Generate anonymized value for a field
 */
function anonymizeValue(fieldName: string, originalValue: unknown): unknown {
  if (originalValue === null || originalValue === undefined) {
    return null;
  }

  if (fieldName.includes('email')) {
    return `anonymized_${Date.now()}@deleted.local`;
  }

  if (fieldName.includes('name') || fieldName.includes('full_name')) {
    return '[REDACTED]';
  }

  if (fieldName.includes('phone')) {
    return '+0000000000';
  }

  if (fieldName.includes('ip_address')) {
    return '0.0.0.0';
  }

  if (fieldName.includes('user_agent')) {
    return '[REDACTED]';
  }

  if (fieldName.includes('url') || fieldName.includes('avatar')) {
    return null;
  }

  return '[REDACTED]';
}

/**
 * Execute data retention for a specific policy
 */
export async function executeRetentionPolicy(
  supabase: any,
  policy: RetentionPolicy
): Promise<RetentionResult> {
  const result: RetentionResult = {
    tableName: policy.tableName,
    recordsProcessed: 0,
    recordsDeleted: 0,
    recordsAnonymized: 0,
    errors: [],
    executedAt: new Date().toISOString(),
  };

  if (!policy.isActive) {
    return result;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);
  const cutoffISOString = cutoffDate.toISOString();

  try {
    // Build query based on table and conditions
    let query = supabase
      .from(policy.tableName)
      .select('id', { count: 'exact' })
      .lt('created_at', cutoffISOString);

    // Apply additional conditions if specified
    if (policy.conditions) {
      for (const [key, value] of Object.entries(policy.conditions)) {
        if (value === 'NOT NULL') {
          query = query.not(key, 'is', null);
        } else if (value === 'NULL') {
          query = query.is(key, null);
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { count, error: countError } = await query;

    if (countError) {
      result.errors.push(`Count error: ${countError.message}`);
      return result;
    }

    result.recordsProcessed = count || 0;

    if (result.recordsProcessed === 0) {
      return result;
    }

    // Execute deletion strategy
    switch (policy.deletionStrategy) {
      case 'hard_delete': {
        let deleteQuery = supabase
          .from(policy.tableName)
          .delete()
          .lt('created_at', cutoffISOString);

        if (policy.conditions) {
          for (const [key, value] of Object.entries(policy.conditions)) {
            if (value === 'NOT NULL') {
              deleteQuery = deleteQuery.not(key, 'is', null);
            } else if (value === 'NULL') {
              deleteQuery = deleteQuery.is(key, null);
            } else {
              deleteQuery = deleteQuery.eq(key, value);
            }
          }
        }

        const { error: deleteError } = await deleteQuery;

        if (deleteError) {
          result.errors.push(`Delete error: ${deleteError.message}`);
        } else {
          result.recordsDeleted = result.recordsProcessed;
        }
        break;
      }

      case 'soft_delete': {
        let softDeleteQuery = supabase
          .from(policy.tableName)
          .update({ deleted_at: new Date().toISOString() })
          .lt('created_at', cutoffISOString)
          .is('deleted_at', null);

        if (policy.conditions) {
          for (const [key, value] of Object.entries(policy.conditions)) {
            if (value === 'NOT NULL') {
              softDeleteQuery = softDeleteQuery.not(key, 'is', null);
            } else if (value === 'NULL') {
              softDeleteQuery = softDeleteQuery.is(key, null);
            } else {
              softDeleteQuery = softDeleteQuery.eq(key, value);
            }
          }
        }

        const { error: softDeleteError } = await softDeleteQuery;

        if (softDeleteError) {
          result.errors.push(`Soft delete error: ${softDeleteError.message}`);
        } else {
          result.recordsDeleted = result.recordsProcessed;
        }
        break;
      }

      case 'anonymize': {
        const fieldsToAnonymize = anonymizationFields[policy.tableName] || [];
        
        if (fieldsToAnonymize.length === 0) {
          result.errors.push(`No anonymization fields defined for ${policy.tableName}`);
          break;
        }

        // Get records to anonymize
        let selectQuery = supabase
          .from(policy.tableName)
          .select('id')
          .lt('created_at', cutoffISOString);

        if (policy.conditions) {
          for (const [key, value] of Object.entries(policy.conditions)) {
            if (value === 'NOT NULL') {
              selectQuery = selectQuery.not(key, 'is', null);
            } else if (value === 'NULL') {
              selectQuery = selectQuery.is(key, null);
            } else {
              selectQuery = selectQuery.eq(key, value);
            }
          }
        }

        const { data: records, error: selectError } = await selectQuery;

        if (selectError) {
          result.errors.push(`Select error: ${selectError.message}`);
          break;
        }

        if (!records || records.length === 0) {
          break;
        }

        // Build anonymization update
        const anonymizedData: Record<string, unknown> = {
          anonymized_at: new Date().toISOString(),
        };

        for (const field of fieldsToAnonymize) {
          anonymizedData[field] = anonymizeValue(field, 'placeholder');
        }

        const recordIds = records.map((r: { id: string }) => r.id);

        const { error: updateError } = await supabase
          .from(policy.tableName)
          .update(anonymizedData)
          .in('id', recordIds);

        if (updateError) {
          result.errors.push(`Anonymize error: ${updateError.message}`);
        } else {
          result.recordsAnonymized = records.length;
        }
        break;
      }
    }
  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Execute all active retention policies
 */
export async function executeAllRetentionPolicies(
  supabase: any
): Promise<RetentionResult[]> {
  const results: RetentionResult[] = [];

  // Get policies from database or use defaults
  const { data: policies } = await supabase
    .from('data_retention_policies')
    .select('*')
    .eq('is_active', true);

  const policiesToExecute = policies && policies.length > 0
    ? policies as RetentionPolicy[]
    : defaultRetentionPolicies.map((p, i) => ({
        ...p,
        id: `default-${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

  for (const policy of policiesToExecute) {
    const result = await executeRetentionPolicy(supabase, policy);
    results.push(result);

    // Log the result
    if (result.recordsDeleted > 0 || result.recordsAnonymized > 0) {
      await supabase.from('audit_logs').insert({
        action: 'data_retention_executed',
        entity_type: policy.tableName,
        metadata: {
          policy_id: policy.id,
          records_processed: result.recordsProcessed,
          records_deleted: result.recordsDeleted,
          records_anonymized: result.recordsAnonymized,
          errors: result.errors,
        },
      });
    }
  }

  return results;
}

/**
 * Get retention policy summary for a table
 */
export function getRetentionPolicySummary(tableName: string): {
  retentionDays: number;
  strategy: string;
  description: string;
} | null {
  const policy = defaultRetentionPolicies.find((p) => p.tableName === tableName);

  if (!policy) {
    return null;
  }

  const strategyDescriptions: Record<string, string> = {
    hard_delete: 'Permanently deleted',
    soft_delete: 'Marked as deleted but retained',
    anonymize: 'Personal data anonymized, record retained',
  };

  return {
    retentionDays: policy.retentionDays,
    strategy: policy.deletionStrategy,
    description: strategyDescriptions[policy.deletionStrategy] || 'Unknown',
  };
}

/**
 * Calculate when data will be deleted based on creation date
 */
export function calculateDeletionDate(
  tableName: string,
  createdAt: Date
): Date | null {
  const policy = defaultRetentionPolicies.find((p) => p.tableName === tableName);

  if (!policy) {
    return null;
  }

  const deletionDate = new Date(createdAt);
  deletionDate.setDate(deletionDate.getDate() + policy.retentionDays);

  return deletionDate;
}

const dataRetentionUtils = {
  defaultRetentionPolicies,
  executeRetentionPolicy,
  executeAllRetentionPolicies,
  getRetentionPolicySummary,
  calculateDeletionDate,
};

export default dataRetentionUtils;
