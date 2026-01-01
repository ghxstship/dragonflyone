import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const issueSchema = z.object({
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
    const poId = params.id;

    const body = await request.json().catch(() => ({}));
    const validatedData = issueSchema.parse(body);

    // Check if PO exists and is approved
    const { data: po, error: poError } = await supabase
      .from('finance_purchase_orders')
      .select(`
        id, 
        status, 
        organization_id,
        po_number,
        vendor_profile:vendor_profiles(id, name, email)
      `)
      .eq('id', poId)
      .single();

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    if (po.status !== 'approved' && po.status !== 'draft') {
      return NextResponse.json(
        { error: 'Purchase order cannot be issued in its current status' },
        { status: 400 }
      );
    }

    // Update PO status to issued
    const { data: updatedPO, error: updateError } = await supabase
      .from('finance_purchase_orders')
      .update({
        status: 'issued',
        issued_at: new Date().toISOString(),
        send_method: validatedData.send_method,
        updated_at: new Date().toISOString(),
      })
      .eq('id', poId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to issue purchase order' },
        { status: 500 }
      );
    }

    // Send notification based on send_method
    const vendorProfile = po.vendor_profile as { id: string; name: string; email: string } | null;
    
    if (validatedData.send_method === 'email' && vendorProfile?.email) {
      // Create notification record for email delivery
      await supabase.from('notifications').insert({
        type: 'purchase_order_issued',
        title: 'Purchase Order Issued',
        message: `Purchase Order ${po.po_number} has been issued to ${vendorProfile.name}`,
        metadata: {
          po_id: poId,
          po_number: po.po_number,
          vendor_id: vendorProfile.id,
          vendor_email: vendorProfile.email,
          send_method: validatedData.send_method,
          custom_message: validatedData.message,
          cc_emails: validatedData.cc_emails,
        },
        read: false,
        created_at: new Date().toISOString(),
      });

      // Log email delivery request
      await supabase.from('email_queue').insert({
        organization_id: po.organization_id,
        template: 'purchase_order_issued',
        to_email: vendorProfile.email,
        cc_emails: validatedData.cc_emails || [],
        subject: `Purchase Order ${po.po_number}`,
        metadata: {
          po_id: poId,
          po_number: po.po_number,
          vendor_name: vendorProfile.name,
          custom_message: validatedData.message,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } else if (validatedData.send_method === 'portal') {
      // Create vendor portal notification
      await supabase.from('vendor_notifications').insert({
        vendor_profile_id: vendorProfile?.id,
        type: 'purchase_order',
        title: `New Purchase Order: ${po.po_number}`,
        message: validatedData.message || `A new purchase order has been issued for your review.`,
        reference_type: 'purchase_order',
        reference_id: poId,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      purchase_order: updatedPO,
      message: `Purchase order issued via ${validatedData.send_method}`,
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
