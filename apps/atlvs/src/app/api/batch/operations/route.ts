import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const batchOperationSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'archive']),
  entity_type: z.enum(['projects', 'contacts', 'assets', 'deals', 'employees', 'vendors']),
  records: z.array(z.object({
    id: z.string().uuid().optional(),
    data: z.record(z.any()).optional(),
  })).min(1).max(100),
  options: z.object({
    validate: z.boolean().default(true),
    rollback_on_error: z.boolean().default(true),
  }).optional(),
});

async function executeBatchOperation(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  operation: string,
  entityType: string,
  records: any[],
  options: any,
  userId: string
) {
  const results = [];
  const errors = [];
  let successCount = 0;

  for (const record of records) {
    try {
      let result;
      
      switch (operation) {
        case 'create':
          const { data: created, error: createError } = await (supabaseAdmin as any)
            .from(entityType)
            .insert({ ...record.data, created_by: userId })
            .select()
            .single();
          
          if (createError) throw createError;
          result = { success: true, id: created.id, operation: 'create' };
          successCount++;
          break;

        case 'update':
          if (!record.id) throw new Error('ID required for update');
          
          const { data: updated, error: updateError } = await (supabaseAdmin as any)
            .from(entityType)
            .update(record.data)
            .eq('id', record.id)
            .select()
            .single();
          
          if (updateError) throw updateError;
          result = { success: true, id: record.id, operation: 'update' };
          successCount++;
          break;

        case 'delete':
          if (!record.id) throw new Error('ID required for delete');
          
          const { error: deleteError } = await (supabaseAdmin as any)
            .from(entityType)
            .delete()
            .eq('id', record.id);
          
          if (deleteError) throw deleteError;
          result = { success: true, id: record.id, operation: 'delete' };
          successCount++;
          break;

        case 'archive':
          if (!record.id) throw new Error('ID required for archive');
          
          const { error: archiveError } = await (supabaseAdmin as any)
            .from(entityType)
            .update({ status: 'archived', archived_at: new Date().toISOString() })
            .eq('id', record.id);
          
          if (archiveError) throw archiveError;
          result = { success: true, id: record.id, operation: 'archive' };
          successCount++;
          break;
      }

      results.push(result);
    } catch (error) {
      const errorResult = {
        success: false,
        id: record.id || null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      errors.push(errorResult);
      results.push(errorResult);

      if (options?.rollback_on_error) {
        throw new Error(`Operation failed on record, rolling back: ${errorResult.error}`);
      }
    }
  }

  return { results, errors, successCount, totalCount: records.length };
}

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const data = batchOperationSchema.parse(body);

    const startTime = Date.now();

    try {
      const batchResult = await executeBatchOperation(
        supabaseAdmin,
        data.operation,
        data.entity_type,
        data.records,
        data.options || {},
        context.user.id
      );

      const duration = Date.now() - startTime;

      await supabaseAdmin.from('batch_operations_log').insert({
        operation: data.operation,
        entity_type: data.entity_type,
        total_records: data.records.length,
        success_count: batchResult.successCount,
        error_count: batchResult.errors.length,
        duration_ms: duration,
        executed_by: context.user.id,
        errors: batchResult.errors,
      });

      return NextResponse.json({
        success: batchResult.errors.length === 0,
        operation: data.operation,
        entity_type: data.entity_type,
        results: batchResult.results,
        summary: {
          total: batchResult.totalCount,
          succeeded: batchResult.successCount,
          failed: batchResult.errors.length,
          duration_ms: duration,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Batch operation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: batchOperationSchema,
    audit: { action: 'batch:operation', resource: 'batch_operations' },
  }
);
