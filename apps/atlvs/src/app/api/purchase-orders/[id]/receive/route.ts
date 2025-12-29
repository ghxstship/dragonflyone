import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const receiptSchema = z.object({
  received_items: z.array(z.object({
    item_id: z.string().uuid(),
    quantity_received: z.number().min(0),
    notes: z.string().optional(),
  })),
  received_by: z.string().optional(),
  receipt_date: z.string().optional(),
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
    const poId = params.id;

    // Parse request body
    const body = await request.json();
    const validatedData = receiptSchema.parse(body);

    // Check if PO exists
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('id, status, organization_id')
      .eq('id', poId)
      .single();

    if (poError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    if (po.status !== 'issued' && po.status !== 'partial') {
      return NextResponse.json(
        { error: 'Purchase order cannot receive items in its current status' },
        { status: 400 }
      );
    }

    // Create receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('po_receipts')
      .insert({
        purchase_order_id: poId,
        organization_id: po.organization_id,
        received_by: validatedData.received_by || null,
        receipt_date: validatedData.receipt_date || new Date().toISOString(),
        notes: validatedData.notes || null,
        items: validatedData.received_items,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (receiptError) {
      return NextResponse.json(
        { error: 'Failed to create receipt' },
        { status: 500 }
      );
    }

    // Check if all items are fully received
    const totalReceived = validatedData.received_items.reduce(
      (sum, item) => sum + item.quantity_received, 0
    );

    // Update PO status based on receipt
    const newStatus = totalReceived > 0 ? 'partial' : po.status;
    
    await supabase
      .from('purchase_orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', poId);

    return NextResponse.json({
      success: true,
      receipt,
      message: 'Receipt recorded successfully',
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
