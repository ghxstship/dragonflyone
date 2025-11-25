// apps/atlvs/src/app/api/advancing/requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const updateAdvanceSchema = z.object({
  status: z.enum(['draft', 'submitted', 'cancelled']).optional(),
  team_workspace: z.string().optional(),
  activation_name: z.string().optional(),
  estimated_cost: z.number().nonnegative().optional(),
});

/**
 * GET /api/advancing/requests/[id]
 * Get details of a specific advance request with items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const { id } = params;

    const { data, error } = await supabase
      .from('production_advances')
      .select(`
        *,
        project:projects(id, name, code, budget),
        submitter:platform_users!production_advances_submitter_id_fkey(id, full_name, email),
        reviewed_by_user:platform_users!production_advances_reviewed_by_fkey(id, full_name, email),
        fulfilled_by_user:platform_users!production_advances_fulfilled_by_fkey(id, full_name, email),
        organization:organizations(id, name, slug),
        items:production_advance_items(
          *,
          catalog_item:production_advancing_catalog(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Advance request not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching advance:', error);
      return NextResponse.json(
        { error: 'Failed to fetch advance request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/advancing/requests/[id]
 * Update an advance request (only allowed for draft status)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validation = updateAdvanceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Check current status
    const { data: existing, error: fetchError } = await supabase
      .from('production_advances')
      .select('status, submitter_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Advance request not found' },
        { status: 404 }
      );
    }

    // Only allow updates for draft or submitted status
    if (!['draft', 'submitted'].includes(existing.status as string)) {
      return NextResponse.json(
        { error: 'Cannot update advance in current status' },
        { status: 400 }
      );
    }

    // Update the advance
    const { data, error } = await supabase
      .from('production_advances')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating advance:', error);
      return NextResponse.json(
        { error: 'Failed to update advance request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/advancing/requests/[id]
 * Delete an advance request (only allowed for draft status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const { id } = params;

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

    // Only allow deletion for draft status
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft advances' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('production_advances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting advance:', error);
      return NextResponse.json(
        { error: 'Failed to delete advance request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
