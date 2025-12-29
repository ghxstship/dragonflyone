import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const sendSchema = z.object({
  vendor_ids: z.array(z.string().uuid()).min(1),
  message: z.string().optional(),
  deadline: z.string().optional(),
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
    const rfpId = params.id;

    const body = await request.json();
    const validatedData = sendSchema.parse(body);

    // Check if RFP exists
    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .select('id, status, organization_id, title')
      .eq('id', rfpId)
      .single();

    if (rfpError || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    if (rfp.status !== 'draft') {
      return NextResponse.json(
        { error: 'RFP has already been sent' },
        { status: 400 }
      );
    }

    // Create RFP vendor records
    const rfpVendors = validatedData.vendor_ids.map(vendorId => ({
      rfp_id: rfpId,
      vendor_profile_id: vendorId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    const { error: vendorError } = await supabase
      .from('rfp_vendors')
      .insert(rfpVendors);

    if (vendorError) {
      return NextResponse.json(
        { error: 'Failed to send RFP to vendors' },
        { status: 500 }
      );
    }

    // Update RFP status
    const { data: updatedRfp, error: updateError } = await supabase
      .from('rfps')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        deadline: validatedData.deadline || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rfpId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update RFP status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rfp: updatedRfp,
      vendors_notified: validatedData.vendor_ids.length,
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
