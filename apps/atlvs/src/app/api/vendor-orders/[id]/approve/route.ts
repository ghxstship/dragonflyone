import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const approveSchema = z.object({
  approver_notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const orderId = params.id;

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validatedData = approveSchema.parse(body);

    // Check if order exists and is pending approval
    const { data: order, error: orderError } = await supabase
      .from('vendor_orders')
      .select('id, status, organization_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending_approval' && order.status !== 'draft') {
      return NextResponse.json(
        { error: 'Order cannot be approved in its current status' },
        { status: 400 }
      );
    }

    // Update order status to approved
    const { data: updatedOrder, error: updateError } = await supabase
      .from('vendor_orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to approve order' },
        { status: 500 }
      );
    }

    // Create approval record if table exists
    await supabase
      .from('vendor_order_approvals')
      .insert({
        vendor_order_id: orderId,
        action: 'approved',
        notes: validatedData.approver_notes || null,
        created_at: new Date().toISOString(),
      })
      .catch(() => {
        // Table may not exist, continue
      });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
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
