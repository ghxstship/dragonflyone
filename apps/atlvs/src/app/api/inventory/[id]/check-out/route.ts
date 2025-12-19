import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const checkOutSchema = z.object({
  booking_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  checked_out_to: z.string(),
  quantity: z.number().positive().default(1),
  expected_return_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const itemId = params.id;

    const body = await request.json();
    const validatedData = checkOutSchema.parse(body);

    // Check if item exists and has available quantity
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, name, quantity_available, organization_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    if ((item.quantity_available || 0) < validatedData.quantity) {
      return NextResponse.json(
        { error: `Insufficient quantity available. Only ${item.quantity_available} available.` },
        { status: 400 }
      );
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        organization_id: item.organization_id,
        transaction_type: 'check_out',
        quantity: validatedData.quantity,
        booking_id: validatedData.booking_id || null,
        event_id: validatedData.event_id || null,
        checked_out_to: validatedData.checked_out_to,
        checked_out_at: new Date().toISOString(),
        expected_return_date: validatedData.expected_return_date || null,
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
    const newQuantity = (item.quantity_available || 0) - validatedData.quantity;
    await supabase
      .from('inventory_items')
      .update({
        quantity_available: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    return NextResponse.json({
      success: true,
      transaction,
      remaining_quantity: newQuantity,
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
