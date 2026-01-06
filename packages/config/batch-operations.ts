/**
 * Batch Operations System
 * Execute bulk operations on multiple entities with progress tracking
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

export type BatchOperationType =
  | 'update'
  | 'delete'
  | 'archive'
  | 'assign'
  | 'tag'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'duplicate';

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

export interface BatchOperation {
  id: string;
  user_id: string;
  operation_type: BatchOperationType;
  entity_type: string;
  entity_ids: string[];
  parameters?: Record<string, unknown>;
  status: BatchStatus;
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  results?: Array<{
    entity_id: string;
    success: boolean;
    error?: string;
  }>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Type for dynamic table access - all table names in the database
type TableName = keyof Database['public']['Tables'];

/**
 * Batch Operations Engine
 * Handles bulk operations with progress tracking and error handling
 */
export class BatchOperationsEngine {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Helper for dynamic table access with proper typing
   * Used when table name is determined at runtime
   */
  private dynamicFrom(tableName: string) {
    return this.supabase.from(tableName as TableName);
  }

  /**
   * Create and execute a batch operation
   */
  async executeBatchOperation(
    userId: string,
    operationType: BatchOperationType,
    entityType: string,
    entityIds: string[],
    parameters?: Record<string, unknown>
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Create batch operation record
      const { data, error } = await this.supabase
        .from('batch_operations')
        .insert({
          user_id: userId,
          operation_type: operationType,
          entity_type: entityType,
          entity_ids: entityIds,
          parameters: parameters,
          status: 'pending',
          total_count: entityIds.length,
          processed_count: 0,
          success_count: 0,
          failed_count: 0,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Start processing asynchronously
      this.processBatchOperation(data.id);

      return { success: true, jobId: data.id };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Process batch operation
   */
  private async processBatchOperation(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await this.supabase
        .from('batch_operations')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Get operation details
      const { data: operation, error: opError } = await this.supabase
        .from('batch_operations')
        .select('*')
        .eq('id', jobId)
        .single();

      if (opError || !operation) {
        throw new Error('Operation not found');
      }

      const results: Array<{ entity_id: string; success: boolean; error?: string }> = [];
      let successCount = 0;
      let failedCount = 0;

      // Process each entity
      for (const entityId of operation.entity_ids) {
        try {
          await this.executeOperation(
            operation.operation_type as BatchOperationType,
            operation.entity_type,
            entityId,
            operation.parameters as Record<string, unknown> | undefined
          );

          results.push({ entity_id: entityId, success: true });
          successCount++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            entity_id: entityId,
            success: false,
            error: errorMessage,
          });
          failedCount++;
        }

        // Update progress
        await this.supabase
          .from('batch_operations')
          .update({
            processed_count: results.length,
            success_count: successCount,
            failed_count: failedCount,
            results,
          })
          .eq('id', jobId);
      }

      // Determine final status
      const finalStatus: BatchStatus =
        failedCount === 0 ? 'completed' : successCount === 0 ? 'failed' : 'partial';

      // Update operation with completion
      await this.supabase
        .from('batch_operations')
        .update({
          status: finalStatus,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Update operation with error
      await this.supabase
        .from('batch_operations')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }
  }

  /**
   * Execute single operation on an entity
   */
  private async executeOperation(
    operationType: BatchOperationType,
    entityType: string,
    entityId: string,
    parameters?: Record<string, unknown>
  ): Promise<void> {
    switch (operationType) {
      case 'update':
        await this.updateEntity(entityType, entityId, parameters);
        break;

      case 'delete':
        await this.deleteEntity(entityType, entityId);
        break;

      case 'archive':
        await this.archiveEntity(entityType, entityId);
        break;

      case 'assign':
        await this.assignEntity(entityType, entityId, parameters);
        break;

      case 'tag':
        await this.tagEntity(entityType, entityId, parameters);
        break;

      case 'approve':
        await this.approveEntity(entityType, entityId);
        break;

      case 'reject':
        await this.rejectEntity(entityType, entityId, parameters);
        break;

      case 'duplicate':
        await this.duplicateEntity(entityType, entityId);
        break;

      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }

  /**
   * Update entity
   */
  private async updateEntity(
    entityType: string,
    entityId: string,
    updates?: Record<string, unknown>
  ): Promise<void> {
    if (!updates) {
      throw new Error('Update parameters required');
    }

    const { error } = await this.dynamicFrom(entityType)
      .update(updates)
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Delete entity
   */
  private async deleteEntity(entityType: string, entityId: string): Promise<void> {
    const { error } = await this.dynamicFrom(entityType)
      .delete()
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Archive entity
   */
  private async archiveEntity(entityType: string, entityId: string): Promise<void> {
    const { error } = await this.dynamicFrom(entityType)
      .update({ archived: true, archived_at: new Date().toISOString() })
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Assign entity
   */
  private async assignEntity(
    entityType: string,
    entityId: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    if (!params?.assignee_id) {
      throw new Error('Assignee ID required');
    }

    const { error } = await this.dynamicFrom(entityType)
      .update({ assigned_to: params.assignee_id })
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Tag entity
   */
  private async tagEntity(
    entityType: string,
    entityId: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    if (!params?.tags) {
      throw new Error('Tags required');
    }

    const { error } = await this.dynamicFrom(entityType)
      .update({ tags: params.tags })
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Approve entity
   */
  private async approveEntity(entityType: string, entityId: string): Promise<void> {
    const { error } = await this.dynamicFrom(entityType)
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Reject entity
   */
  private async rejectEntity(
    entityType: string,
    entityId: string,
    params?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.dynamicFrom(entityType)
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: params?.reason,
      })
      .eq('id', entityId);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Duplicate entity
   */
  private async duplicateEntity(entityType: string, entityId: string): Promise<void> {
    // Get original entity
    const { data: original, error: fetchError } = await this.dynamicFrom(entityType)
      .select('*')
      .eq('id', entityId)
      .single();

    if (fetchError || !original) {
      throw new Error('Entity not found');
    }

    // Create duplicate without id and timestamps - use rest operator to exclude system fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _excludedId, created_at: _excludedCreatedAt, updated_at: _excludedUpdatedAt, ...duplicateData } = original;
    const duplicate = {
      ...duplicateData,
      name: `${duplicateData.name} (Copy)`,
    };

    const { error: createError } = await this.dynamicFrom(entityType)
      .insert(duplicate);

    if (createError) {
      throw new Error(createError.message);
    }
  }

  /**
   * Get batch operation status
   */
  async getBatchOperation(jobId: string): Promise<BatchOperation | null> {
    const { data, error } = await this.supabase
      .from('batch_operations')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      operation_type: data.operation_type as BatchOperationType,
      entity_type: data.entity_type,
      entity_ids: data.entity_ids as string[],
      parameters: data.parameters as Record<string, unknown> | undefined,
      status: data.status as BatchStatus,
      total_count: data.total_count,
      processed_count: data.processed_count ?? 0,
      success_count: data.success_count ?? 0,
      failed_count: data.failed_count ?? 0,
      results: data.results as Array<{ entity_id: string; success: boolean; error?: string }> | undefined,
      error_message: data.error_message ?? undefined,
      created_at: data.created_at,
      completed_at: data.completed_at ?? undefined,
    };
  }

  /**
   * Get user's batch operation history
   */
  async getBatchOperationHistory(userId: string, limit: number = 50): Promise<BatchOperation[]> {
    const { data, error } = await this.supabase
      .from('batch_operations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      operation_type: row.operation_type as BatchOperationType,
      entity_type: row.entity_type,
      entity_ids: row.entity_ids as string[],
      parameters: row.parameters as Record<string, unknown> | undefined,
      status: row.status as BatchStatus,
      total_count: row.total_count,
      processed_count: row.processed_count ?? 0,
      success_count: row.success_count ?? 0,
      failed_count: row.failed_count ?? 0,
      results: row.results as Array<{ entity_id: string; success: boolean; error?: string }> | undefined,
      error_message: row.error_message ?? undefined,
      created_at: row.created_at,
      completed_at: row.completed_at ?? undefined,
    }));
  }

  /**
   * Cancel a pending batch operation
   */
  async cancelBatchOperation(jobId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('batch_operations')
      .update({
        status: 'failed',
        error_message: 'Cancelled by user',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    return !error;
  }

  /**
   * Retry failed operations from a batch
   */
  async retryFailedOperations(
    jobId: string,
    userId: string
  ): Promise<{ success: boolean; newJobId?: string; error?: string }> {
    const operation = await this.getBatchOperation(jobId);

    if (!operation || operation.user_id !== userId) {
      return { success: false, error: 'Operation not found' };
    }

    // Get failed entity IDs
    const failedIds =
      operation.results
        ?.filter((r) => !r.success)
        .map((r) => r.entity_id) || [];

    if (failedIds.length === 0) {
      return { success: false, error: 'No failed operations to retry' };
    }

    // Create new batch operation for failed items
    return this.executeBatchOperation(
      userId,
      operation.operation_type,
      operation.entity_type,
      failedIds,
      operation.parameters
    );
  }
}

/**
 * Export batch operations utilities
 */
export const batchOperations = {
  createEngine: (supabase: SupabaseClient<Database>) => new BatchOperationsEngine(supabase),
};

export default batchOperations;
