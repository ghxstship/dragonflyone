// apps/atlvs/src/app/api/advancing/requests/[id]/fulfill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const fulfillSchema = z.object({
  items: z.array(
    z.object({
      item_id: z.string().uuid(),
      quantity_fulfilled: z.number().nonnegative(),
      notes: z.string().optional(),
    })
  ).min(1),
  fulfillment_notes: z.string().optional(),
  actual_cost: z.number().nonnegative().optional(),
});

/**
 * POST /api/advancing/requests/[id]/fulfill
 * Mark advance items as fulfilled (COMPVSS role)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin;
    const { id } = params;
    const body = await request.json();

    // Validate request body
    const validation = fulfillSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get fulfiller info (from auth)
    const fulfiller_id = request.headers.get('x-user-id');

    if (!fulfiller_id) {
      return NextResponse.json(
        { error: 'Missing authentication' },
        { status: 401 }
      );
    }

    // Check current status
    const { data: existing, error: fetchError } = await supabase
      .from('production_advances')
      .select('status, items:production_advance_items(*)')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Advance request not found' },
        { status: 404 }
      );
    }

    // Only allow fulfillment for approved or in_progress status
    if (!['approved', 'in_progress'].includes(existing.status as string)) {
      return NextResponse.json(
        { error: 'Cannot fulfill advance in current status' },
        { status: 400 }
      );
    }

    // Update fulfillment for each item
    const items = (existing as any).items || [];
    const updatePromises = validation.data.items.map(async (item) => {
      const existingItem = items.find((i: any) => i.id === item.item_id);
      if (!existingItem) {
        throw new Error(`Item ${item.item_id} not found in advance`);
      }

      const newQuantityFulfilled = (existingItem.quantity_fulfilled || 0) + item.quantity_fulfilled;
      const fulfillmentStatus =
        newQuantityFulfilled >= existingItem.quantity
          ? 'complete'
          : newQuantityFulfilled > 0
          ? 'partial'
          : 'pending';

      return supabase
        .from('production_advance_items')
        .update({
          quantity_fulfilled: newQuantityFulfilled,
          fulfillment_status: fulfillmentStatus,
          notes: item.notes || existingItem.notes,
        })
        .eq('id', item.item_id);
    });

    const results = await Promise.all(updatePromises);
    const hasErrors = results.some((r) => r.error);

    if (hasErrors) {
      console.error('Error updating items:', results.filter((r) => r.error));
      return NextResponse.json(
        { error: 'Failed to update some items' },
        { status: 500 }
      );
    }

    // Get updated items to check if all are complete
    const { data: updatedItems } = await supabase
      .from('production_advance_items')
      .select('fulfillment_status')
      .eq('advance_id', id);

    const allComplete = updatedItems?.every((item: any) => item.fulfillment_status === 'complete');
    const anyPartial = updatedItems?.some((item: any) => item.fulfillment_status === 'partial');

    // Update advance status
    const newStatus = allComplete ? 'fulfilled' : anyPartial || existing.status === 'approved' ? 'in_progress' : existing.status;

    const { data, error } = await supabase
      .from('production_advances')
      .update({
        status: newStatus,
        fulfilled_by: fulfiller_id,
        fulfilled_at: allComplete ? new Date().toISOString() : (existing as any).fulfilled_at,
        fulfillment_notes: validation.data.fulfillment_notes,
        ...(validation.data.actual_cost !== undefined && {
          actual_cost: validation.data.actual_cost,
        }),
      })
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name, code),
        submitter:platform_users!production_advances_submitter_id_fkey(id, full_name, email),
        fulfilled_by_user:platform_users!production_advances_fulfilled_by_fkey(id, full_name, email),
        items:production_advance_items(
          *,
          catalog_item:production_advancing_catalog(*)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating advance:', error);
      return NextResponse.json(
        { error: 'Failed to update advance', details: error.message },
        { status: 500 }
      );
    }

    // TODO: Send notification if fully fulfilled

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
