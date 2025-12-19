import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const sendSchema = z.object({
  send_method: z.enum(['email', 'portal', 'manual']).default('email'),
  message: z.string().optional(),
  cc_emails: z.array(z.string().email()).optional(),
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
    const validatedData = sendSchema.parse(body);

    // Check if order exists and is approved
    const { data: order, error: orderError } = await supabase
      .from('vendor_orders')
      .select(`
        id, 
        status, 
        organization_id,
        vendor_profile:vendor_profiles(id, name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'approved') {
      return NextResponse.json(
        { error: 'Order must be approved before sending' },
        { status: 400 }
      );
    }

    // Update order status to sent
    const { data: updatedOrder, error: updateError } = await supabase
      .from('vendor_orders')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        send_method: validatedData.send_method,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to send order' },
        { status: 500 }
      );
    }

    // TODO: Integrate with email service to actually send the order
    // For now, we just update the status

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order sent via ${validatedData.send_method}`,
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
