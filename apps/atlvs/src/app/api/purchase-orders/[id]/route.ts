import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const updatePOSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled']).optional(),
  vendor_id: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
  expected_delivery: z.string().datetime().optional(),
  received_date: z.string().datetime().optional(),
  received_by: z.string().uuid().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const { id } = context.params;

    const { data: po, error } = await supabaseAdmin
      .from('purchase_orders')
      .select(`
        *,
        vendor:vendors(id, name, contact_email),
        line_items:purchase_order_items(*),
        created_by_user:platform_users!purchase_orders_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ purchaseOrder: po });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'purchase_order:view', resource: 'purchase_orders' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const { id } = context.params;
    const body = await request.json();
    
    const updates = updatePOSchema.parse(body);

    // Fetch current PO
    const { data: currentPO, error: fetchError } = await supabaseAdmin
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    // Update PO
    const { data: updatedPO, error: updateError } = await supabaseAdmin
      .from('purchase_orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update purchase order', message: updateError.message },
        { status: 500 }
      );
    }

    // If status changed to 'approved', create ledger entries
    if (updates.status === 'approved' && currentPO.status !== 'approved') {
      const { data: items } = await supabaseAdmin
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', id);

      const totalAmount = items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0;

      // Create accounts payable entry
      await supabaseAdmin.from('ledger_entries').insert({
        account_id: 'accounts_payable', // Should reference actual account
        amount: totalAmount,
        type: 'credit',
        description: `PO ${currentPO.po_number} approved`,
        reference_type: 'purchase_order',
        reference_id: id,
        created_by: context.user.id,
      });
    }

    return NextResponse.json({ purchaseOrder: updatedPO });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: updatePOSchema,
    audit: { action: 'purchase_order:update', resource: 'purchase_orders' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const { id } = context.params;

    // Check if PO can be deleted (only draft or pending)
    const { data: po, error: fetchError } = await supabaseAdmin
      .from('purchase_orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !po) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }

    const poStatus = (po as { status: string }).status;
    if (!['draft', 'pending', 'cancelled'].includes(poStatus)) {
      return NextResponse.json(
        { error: 'Cannot delete approved or ordered purchase orders' },
        { status: 400 }
      );
    }

    // Delete PO items first
    await supabaseAdmin
      .from('purchase_order_items')
      .delete()
      .eq('purchase_order_id', id);

    // Delete PO
    const { error: deleteError } = await supabaseAdmin
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete purchase order', message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'purchase_order:delete', resource: 'purchase_orders' },
  }
);
