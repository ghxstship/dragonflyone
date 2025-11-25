// apps/atlvs/src/app/api/advancing/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const batchApproveSchema = z.object({
  request_ids: z.array(z.string().uuid()).min(1).max(50),
  reviewer_notes: z.string().optional(),
  approved_cost_multiplier: z.number().min(0).max(2).optional(),
});

const batchRejectSchema = z.object({
  request_ids: z.array(z.string().uuid()).min(1).max(50),
  reviewer_notes: z.string().min(1),
});

const batchStatusUpdateSchema = z.object({
  request_ids: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum(['cancelled']),
});

/**
 * POST /api/advancing/batch
 * Batch operations for advance requests
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const orgId = request.headers.get('x-organization-id');

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { operation } = body;

    switch (operation) {
      case 'approve':
        return await handleBatchApprove(body, userId, orgId);
      case 'reject':
        return await handleBatchReject(body, userId, orgId);
      case 'update_status':
        return await handleBatchStatusUpdate(body, userId, orgId);
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in batch operation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function handleBatchApprove(
  body: any,
  userId: string,
  orgId: string
): Promise<NextResponse> {
  const validated = batchApproveSchema.parse(body);

  // Fetch all requests
  const { data: advances, error: fetchError } = await supabaseAdmin
    .from('production_advances')
    .select('*')
    .in('id', validated.request_ids)
    .eq('organization_id', orgId);

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch requests', details: fetchError.message },
      { status: 500 }
    );
  }

  // Type for advance records
  type AdvanceRecord = { id: string; status: string; estimated_cost: number | null };
  const typedAdvances = advances as AdvanceRecord[] | null;

  // Validate all can be approved
  const invalidStatuses = typedAdvances?.filter(
    (adv) => !['submitted', 'under_review'].includes(adv.status)
  );

  if (invalidStatuses && invalidStatuses.length > 0) {
    return NextResponse.json(
      {
        error: 'Some requests cannot be approved',
        invalid_ids: invalidStatuses.map((adv) => adv.id),
      },
      { status: 400 }
    );
  }

  // Prepare updates
  const updates = typedAdvances?.map((adv) => ({
    id: adv.id,
    status: 'approved' as const,
    reviewed_by: userId,
    reviewed_at: new Date().toISOString(),
    reviewer_notes: validated.reviewer_notes,
    approved_cost: validated.approved_cost_multiplier
      ? (adv.estimated_cost || 0) * validated.approved_cost_multiplier
      : adv.estimated_cost,
  }));

  // Batch update
  const results = await Promise.all(
    (updates || []).map((update) =>
      supabaseAdmin
        .from('production_advances')
        .update(update)
        .eq('id', update.id)
        .select()
        .single()
    )
  );

  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  return NextResponse.json({
    data: {
      successful: successful.length,
      failed: failed.length,
      results: successful.map((r) => r.data),
      errors: failed.map((r) => ({ id: r.error })),
    },
  });
}

async function handleBatchReject(
  body: any,
  userId: string,
  orgId: string
): Promise<NextResponse> {
  const validated = batchRejectSchema.parse(body);

  // Fetch all requests
  const { data: advances, error: fetchError } = await supabaseAdmin
    .from('production_advances')
    .select('*')
    .in('id', validated.request_ids)
    .eq('organization_id', orgId);

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch requests', details: fetchError.message },
      { status: 500 }
    );
  }

  // Type for advance records
  type RejectAdvanceRecord = { id: string; status: string };
  const typedRejectAdvances = advances as RejectAdvanceRecord[] | null;

  // Validate all can be rejected
  const invalidStatuses = typedRejectAdvances?.filter(
    (adv) => !['submitted', 'under_review'].includes(adv.status)
  );

  if (invalidStatuses && invalidStatuses.length > 0) {
    return NextResponse.json(
      {
        error: 'Some requests cannot be rejected',
        invalid_ids: invalidStatuses.map((adv) => adv.id),
      },
      { status: 400 }
    );
  }

  // Batch update
  const results = await Promise.all(
    validated.request_ids.map((id) =>
      supabaseAdmin
        .from('production_advances')
        .update({
          status: 'rejected',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: validated.reviewer_notes,
        })
        .eq('id', id)
        .select()
        .single()
    )
  );

  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  return NextResponse.json({
    data: {
      successful: successful.length,
      failed: failed.length,
      results: successful.map((r) => r.data),
    },
  });
}

async function handleBatchStatusUpdate(
  body: any,
  userId: string,
  orgId: string
): Promise<NextResponse> {
  const validated = batchStatusUpdateSchema.parse(body);

  const results = await Promise.all(
    validated.request_ids.map((id) =>
      supabaseAdmin
        .from('production_advances')
        .update({ status: validated.status })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single()
    )
  );

  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  return NextResponse.json({
    data: {
      successful: successful.length,
      failed: failed.length,
    },
  });
}
