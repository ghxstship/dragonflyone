// apps/atlvs/src/app/api/advancing/requests/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const rejectSchema = z.object({
  reviewer_notes: z.string().min(1, 'Rejection reason is required'),
});

/**
 * POST /api/advancing/requests/[id]/reject
 * Reject an advance request (ATLVS role only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validation = rejectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get reviewer info (from auth)
    const reviewer_id = request.headers.get('x-user-id');

    if (!reviewer_id) {
      return NextResponse.json(
        { error: 'Missing authentication' },
        { status: 401 }
      );
    }

    // Check current status
    const { data: existing, error: fetchError } = await supabase
      .from('production_advances')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Advance request not found' },
        { status: 404 }
      );
    }

    // Only allow rejection for submitted or under_review status
    if (!['submitted', 'under_review'].includes(existing.status as string)) {
      return NextResponse.json(
        { error: 'Cannot reject advance in current status' },
        { status: 400 }
      );
    }

    // Reject the advance
    const { data, error } = await supabase
      .from('production_advances')
      .update({
        status: 'rejected',
        reviewed_by: reviewer_id,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: validation.data.reviewer_notes,
      })
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name, code),
        submitter:platform_users!production_advances_submitter_id_fkey(id, full_name, email),
        reviewed_by_user:platform_users!production_advances_reviewed_by_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error('Error rejecting advance:', error);
      return NextResponse.json(
        { error: 'Failed to reject advance request', details: error.message },
        { status: 500 }
      );
    }

    // TODO: Send notification to submitter

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
