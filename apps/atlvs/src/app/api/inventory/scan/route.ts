import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const scanSchema = z.object({
  barcode: z.string().min(1),
  action: z.enum(['lookup', 'check_out', 'check_in']).default('lookup'),
  booking_id: z.string().uuid().optional(),
  checked_out_to: z.string().optional(),
  notes: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = scanSchema.parse(body);

    // Look up item by barcode or SKU
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        sku,
        barcode,
        category,
        quantity_total,
        quantity_available,
        location,
        status,
        last_checked_out_at,
        last_checked_in_at
      `)
      .or(`barcode.eq.${validatedData.barcode},sku.eq.${validatedData.barcode}`)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found', barcode: validatedData.barcode },
        { status: 404 }
      );
    }

    // Handle different actions
    if (validatedData.action === 'lookup') {
      // Just return the item details
      return NextResponse.json({
        success: true,
        action: 'lookup',
        item,
      });
    }

    if (validatedData.action === 'check_out') {
      if ((item.quantity_available || 0) <= 0) {
        return NextResponse.json(
          { error: 'No quantity available for check-out' },
          { status: 400 }
        );
      }

      // Create check-out transaction
      const { data: transaction, error: txError } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_item_id: item.id,
          transaction_type: 'check_out',
          quantity: 1,
          booking_id: validatedData.booking_id || null,
          checked_out_to: validatedData.checked_out_to || null,
          checked_out_at: new Date().toISOString(),
          notes: validatedData.notes || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (txError) {
        return NextResponse.json(
          { error: 'Failed to create check-out transaction' },
          { status: 500 }
        );
      }

      // Update item quantity
      await supabase
        .from('inventory_items')
        .update({
          quantity_available: (item.quantity_available || 0) - 1,
          last_checked_out_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      return NextResponse.json({
        success: true,
        action: 'check_out',
        item,
        transaction,
        remaining_quantity: (item.quantity_available || 0) - 1,
      });
    }

    if (validatedData.action === 'check_in') {
      // Create check-in transaction
      const { data: transaction, error: txError } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_item_id: item.id,
          transaction_type: 'check_in',
          quantity: 1,
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
        (item.quantity_available || 0) + 1,
        item.quantity_total || Infinity
      );

      await supabase
        .from('inventory_items')
        .update({
          quantity_available: newQuantity,
          last_checked_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      return NextResponse.json({
        success: true,
        action: 'check_in',
        item,
        transaction,
        available_quantity: newQuantity,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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
