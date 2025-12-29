import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const checkInSchema = z.object({
  transaction_id: z.string().uuid().optional(),
  quantity: z.number().positive().default(1),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).default('good'),
  notes: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const itemId = params.id;

    const body = await request.json();
    const validatedData = checkInSchema.parse(body);

    // Check if item exists
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, name, quantity_available, quantity_total, organization_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // If transaction_id provided, mark that transaction as returned
    if (validatedData.transaction_id) {
      await supabase
        .from('inventory_transactions')
        .update({
          returned_at: new Date().toISOString(),
          return_condition: validatedData.condition,
          return_notes: validatedData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedData.transaction_id);
    }

    // Create check-in transaction record
    const { data: transaction, error: txError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        organization_id: item.organization_id,
        transaction_type: 'check_in',
        quantity: validatedData.quantity,
        condition: validatedData.condition,
        checked_in_at: new Date().toISOString(),
        notes: validatedData.notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json(
        { error: 'Failed to create check-in transaction' },
        { status: 500 }
      );
    }

    // Update item quantity
    const newQuantity = Math.min(
      (item.quantity_available || 0) + validatedData.quantity,
      item.quantity_total || Infinity
    );
    
    await supabase
      .from('inventory_items')
      .update({
        quantity_available: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    // If damaged, create maintenance record
    if (validatedData.condition === 'damaged' || validatedData.condition === 'poor') {
      await supabase
        .from('inventory_maintenance')
        .insert({
          inventory_item_id: itemId,
          organization_id: item.organization_id,
          maintenance_type: 'repair',
          reason: `Check-in condition: ${validatedData.condition}`,
          notes: validatedData.notes || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .catch(() => {
          // Table may not exist
        });
    }

    return NextResponse.json({
      success: true,
      transaction,
      available_quantity: newQuantity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
