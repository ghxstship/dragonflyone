import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const issueSchema = z.object({
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
    const poId = params.id;

    const body = await request.json().catch(() => ({}));
    const validatedData = issueSchema.parse(body);

    // Check if PO exists and is approved
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
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
      .from('purchase_orders')
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

    // TODO: Integrate with email service to actually send the PO
    // For now, we just update the status

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
