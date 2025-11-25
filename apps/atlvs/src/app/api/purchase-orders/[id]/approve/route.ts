import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const approvalSchema = z.object({
  user_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

// POST /api/purchase-orders/[id]/approve - Approve purchase order
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validated = approvalSchema.parse(body);
    const userId = validated.user_id || '00000000-0000-0000-0000-000000000000';

    // Fetch current PO
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendors(id, name, email),
        line_items:purchase_order_line_items(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Validate status for approval
    if (po.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `Cannot approve purchase order in ${po.status} status. Must be pending_approval.` },
        { status: 400 }
      );
    }

    // Check approval authority based on amount
    const { data: approver } = await supabase
      .from('platform_users')
      .select('id, full_name, platform_roles, approval_limit')
      .eq('id', userId)
      .single();

    if (!approver) {
      return NextResponse.json(
        { error: 'Approver not found' },
        { status: 404 }
      );
    }

    // Check if user has approval authority
    const hasApprovalRole = approver.platform_roles?.some((role: string) => 
      ['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN'].includes(role)
    );

    const withinLimit = !approver.approval_limit || po.total_amount <= approver.approval_limit;

    if (!hasApprovalRole && !withinLimit) {
      return NextResponse.json(
        { error: 'Insufficient approval authority for this amount' },
        { status: 403 }
      );
    }

    // Update PO status
    const { data: updatedPO, error: updateError } = await supabase
      .from('purchase_orders')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        approval_notes: validated.notes,
        approval_conditions: validated.conditions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to approve purchase order', details: updateError.message },
        { status: 500 }
      );
    }

    // Create approval record
    await supabase.from('purchase_order_approvals').insert({
      purchase_order_id: id,
      approver_id: userId,
      action: 'approved',
      notes: validated.notes,
      conditions: validated.conditions,
      amount_at_approval: po.total_amount,
    });

    // Log activity
    await supabase.from('purchase_order_activity_log').insert({
      purchase_order_id: id,
      activity_type: 'approved',
      user_id: userId,
      description: `Purchase order approved by ${approver.full_name}`,
      metadata: {
        amount: po.total_amount,
        conditions: validated.conditions,
      },
    });

    // Create accounts payable ledger entry
    await supabase.from('ledger_entries').insert({
      organization_id: po.organization_id,
      account_code: '2000', // Accounts Payable
      entry_type: 'credit',
      amount: po.total_amount,
      description: `PO ${po.po_number} approved - ${po.vendor?.name || 'Vendor'}`,
      reference_type: 'purchase_order',
      reference_id: id,
      entry_date: new Date().toISOString().split('T')[0],
      created_by: userId,
    });

    // Send notification to requester
    await supabase.from('notifications').insert({
      user_id: po.requested_by,
      type: 'purchase_order_approved',
      title: 'Purchase Order Approved',
      message: `Your purchase order ${po.po_number} has been approved`,
      data: {
        purchase_order_id: id,
        po_number: po.po_number,
        amount: po.total_amount,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase order approved',
      purchase_order: updatedPO,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/purchase-orders/[id]/approve:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
