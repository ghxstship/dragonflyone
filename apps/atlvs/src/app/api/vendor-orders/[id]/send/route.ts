import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const sendSchema = z.object({
  send_method: z.enum(['email', 'portal', 'manual']).default('email'),
  message: z.string().optional(),
  cc_emails: z.array(z.string().email()).optional(),
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

    // Send notification based on send_method
    const vendorProfile = order.vendor_profile as { id: string; name: string; email: string } | null;

    if (validatedData.send_method === 'email' && vendorProfile?.email) {
      // Queue email for order delivery
      await supabase.from('email_queue').insert({
        organization_id: order.organization_id,
        template: 'vendor_order_sent',
        to_email: vendorProfile.email,
        cc_emails: validatedData.cc_emails || [],
        subject: `New Order from ${order.organization_id}`,
        metadata: {
          order_id: orderId,
          vendor_id: vendorProfile.id,
          vendor_name: vendorProfile.name,
          custom_message: validatedData.message,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      // Create notification record
      await supabase.from('notifications').insert({
        type: 'vendor_order_sent',
        title: 'Vendor Order Sent',
        message: `Order has been sent to ${vendorProfile.name} (${vendorProfile.email})`,
        metadata: {
          order_id: orderId,
          vendor_id: vendorProfile.id,
          send_method: validatedData.send_method,
        },
        read: false,
        created_at: new Date().toISOString(),
      });
    } else if (validatedData.send_method === 'portal') {
      // Create vendor portal notification
      await supabase.from('vendor_notifications').insert({
        vendor_profile_id: vendorProfile?.id,
        type: 'order',
        title: 'New Order Received',
        message: validatedData.message || 'A new order has been placed for your review.',
        reference_type: 'vendor_order',
        reference_id: orderId,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

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
