import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const receivingSchema = z.object({
  purchase_order_id: z.string().uuid(),
  received_date: z.string().datetime(),
  received_by: z.string().uuid(),
  items: z.array(z.object({
    po_line_id: z.string().uuid(),
    quantity_received: z.number().min(0),
    condition: z.enum(['good', 'damaged', 'partial', 'rejected']),
    notes: z.string().optional(),
    photos: z.array(z.string().url()).optional(),
  })),
  delivery_notes: z.string().optional(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  packing_slip_number: z.string().optional(),
});

const threeWayMatchSchema = z.object({
  purchase_order_id: z.string().uuid(),
  receipt_id: z.string().uuid(),
  invoice_id: z.string().uuid(),
});

// GET - Get receiving data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'receipts' | 'pending' | 'match' | 'discrepancies'
    const poId = searchParams.get('po_id');
    const vendorId = searchParams.get('vendor_id');

    if (type === 'receipts') {
      // Get receiving receipts
      let query = supabase
        .from('po_receipts')
        .select(`
          *,
          purchase_order:purchase_orders(id, po_number, vendor_id),
          received_by_user:platform_users(id, first_name, last_name),
          items:po_receipt_items(*)
        `)
        .order('received_date', { ascending: false });

      if (poId) query = query.eq('purchase_order_id', poId);

      const { data: receipts, error } = await query;

      if (error) throw error;

      return NextResponse.json({ receipts });
    }

    if (type === 'pending') {
      // Get POs pending receiving
      const { data: pendingPOs, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          vendor:vendors(id, name),
          items:po_line_items(id, description, quantity, quantity_received)
        `)
        .in('status', ['approved', 'sent', 'acknowledged', 'partial'])
        .order('expected_delivery', { ascending: true });

      if (error) throw error;

      // Calculate pending quantities
      const enriched = pendingPOs?.map(po => {
        const items = (po.items as any[]) || [];
        const totalOrdered = items.reduce((sum, i) => sum + i.quantity, 0);
        const totalReceived = items.reduce((sum, i) => sum + (i.quantity_received || 0), 0);
        const pendingQty = totalOrdered - totalReceived;

        return {
          ...po,
          total_ordered: totalOrdered,
          total_received: totalReceived,
          pending_quantity: pendingQty,
          is_overdue: po.expected_delivery && new Date(po.expected_delivery) < new Date(),
        };
      }).filter(po => po.pending_quantity > 0);

      return NextResponse.json({
        pending_pos: enriched,
        total_pending: enriched?.length || 0,
        overdue: enriched?.filter(p => p.is_overdue).length || 0,
      });
    }

    if (type === 'match' && poId) {
      // Get three-way match data for a PO
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          items:po_line_items(id, description, quantity, unit_price, total_price, quantity_received)
        `)
        .eq('id', poId)
        .single();

      if (poError) throw poError;

      const { data: receipts } = await supabase
        .from('po_receipts')
        .select(`
          *,
          items:po_receipt_items(po_line_id, quantity_received, condition)
        `)
        .eq('purchase_order_id', poId);

      const { data: invoices } = await supabase
        .from('vendor_invoices')
        .select(`
          *,
          items:vendor_invoice_items(po_line_id, quantity, unit_price, total_price)
        `)
        .eq('purchase_order_id', poId);

      // Calculate match status for each line
      const poItems = (po.items as any[]) || [];
      const matchStatus = poItems.map(item => {
        const receivedQty = receipts?.flatMap(r => (r.items as any[]))
          .filter(ri => ri.po_line_id === item.id)
          .reduce((sum, ri) => sum + ri.quantity_received, 0) || 0;

        const invoicedQty = invoices?.flatMap(i => (i.items as any[]))
          .filter(ii => ii.po_line_id === item.id)
          .reduce((sum, ii) => sum + ii.quantity, 0) || 0;

        const invoicedAmount = invoices?.flatMap(i => (i.items as any[]))
          .filter(ii => ii.po_line_id === item.id)
          .reduce((sum, ii) => sum + ii.total_price, 0) || 0;

        return {
          po_line_id: item.id,
          description: item.description,
          ordered_qty: item.quantity,
          ordered_amount: item.total_price,
          received_qty: receivedQty,
          invoiced_qty: invoicedQty,
          invoiced_amount: invoicedAmount,
          qty_match: item.quantity === receivedQty && receivedQty === invoicedQty,
          amount_match: Math.abs(item.total_price - invoicedAmount) < 0.01,
          discrepancy: {
            qty_variance: item.quantity - receivedQty,
            amount_variance: item.total_price - invoicedAmount,
          },
        };
      });

      const allMatched = matchStatus.every(m => m.qty_match && m.amount_match);

      return NextResponse.json({
        purchase_order: po,
        receipts,
        invoices,
        match_status: matchStatus,
        all_matched: allMatched,
        can_process_payment: allMatched,
      });
    }

    if (type === 'discrepancies') {
      // Get POs with discrepancies
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          vendor:vendors(id, name),
          items:po_line_items(id, quantity, total_price, quantity_received)
        `)
        .in('status', ['partial', 'received']);

      if (error) throw error;

      const discrepancies = [];

      for (const po of pos || []) {
        const { data: invoices } = await supabase
          .from('vendor_invoices')
          .select('items:vendor_invoice_items(po_line_id, quantity, total_price)')
          .eq('purchase_order_id', po.id);

        const items = (po.items as any[]) || [];
        
        for (const item of items) {
          const invoicedQty = invoices?.flatMap(i => (i.items as any[]))
            .filter(ii => ii.po_line_id === item.id)
            .reduce((sum, ii) => sum + ii.quantity, 0) || 0;

          const invoicedAmount = invoices?.flatMap(i => (i.items as any[]))
            .filter(ii => ii.po_line_id === item.id)
            .reduce((sum, ii) => sum + ii.total_price, 0) || 0;

          const qtyVariance = item.quantity - (item.quantity_received || 0);
          const amountVariance = item.total_price - invoicedAmount;

          if (Math.abs(qtyVariance) > 0 || Math.abs(amountVariance) > 0.01) {
            discrepancies.push({
              po_id: po.id,
              po_number: po.po_number,
              vendor_name: (po.vendor as any)?.name,
              po_line_id: item.id,
              ordered_qty: item.quantity,
              received_qty: item.quantity_received || 0,
              invoiced_qty: invoicedQty,
              qty_variance: qtyVariance,
              ordered_amount: item.total_price,
              invoiced_amount: invoicedAmount,
              amount_variance: amountVariance,
            });
          }
        }
      }

      return NextResponse.json({
        discrepancies,
        total_discrepancies: discrepancies.length,
        total_amount_variance: discrepancies.reduce((sum, d) => sum + Math.abs(d.amount_variance), 0),
      });
    }

    // Default: return recent receipts
    const { data: receipts, error } = await supabase
      .from('po_receipts')
      .select(`
        *,
        purchase_order:purchase_orders(id, po_number)
      `)
      .order('received_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ receipts });
  } catch (error: any) {
    console.error('PO receiving error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create receipt or process match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'receive_items') {
      const validated = receivingSchema.parse(body.data);

      // Create receipt record
      const { data: receipt, error: receiptError } = await supabase
        .from('po_receipts')
        .insert({
          purchase_order_id: validated.purchase_order_id,
          received_date: validated.received_date,
          received_by: validated.received_by,
          delivery_notes: validated.delivery_notes,
          carrier: validated.carrier,
          tracking_number: validated.tracking_number,
          packing_slip_number: validated.packing_slip_number,
          status: 'completed',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Create receipt items
      const receiptItems = validated.items.map(item => ({
        receipt_id: receipt.id,
        po_line_id: item.po_line_id,
        quantity_received: item.quantity_received,
        condition: item.condition,
        notes: item.notes,
        photos: item.photos,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('po_receipt_items').insert(receiptItems);

      // Update PO line items with received quantities
      for (const item of validated.items) {
        const { data: poLine } = await supabase
          .from('po_line_items')
          .select('quantity, quantity_received')
          .eq('id', item.po_line_id)
          .single();

        const newReceived = (poLine?.quantity_received || 0) + item.quantity_received;

        await supabase
          .from('po_line_items')
          .update({ quantity_received: newReceived })
          .eq('id', item.po_line_id);
      }

      // Update PO status
      const { data: poLines } = await supabase
        .from('po_line_items')
        .select('quantity, quantity_received')
        .eq('purchase_order_id', validated.purchase_order_id);

      const totalOrdered = poLines?.reduce((sum, l) => sum + l.quantity, 0) || 0;
      const totalReceived = poLines?.reduce((sum, l) => sum + (l.quantity_received || 0), 0) || 0;

      let newStatus = 'partial';
      if (totalReceived >= totalOrdered) {
        newStatus = 'received';
      }

      await supabase
        .from('purchase_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', validated.purchase_order_id);

      return NextResponse.json({ receipt }, { status: 201 });
    }

    if (action === 'process_three_way_match') {
      const validated = threeWayMatchSchema.parse(body.data);

      // Verify all documents exist and match
      const { data: po } = await supabase
        .from('purchase_orders')
        .select('id, total_amount')
        .eq('id', validated.purchase_order_id)
        .single();

      const { data: receipt } = await supabase
        .from('po_receipts')
        .select('id')
        .eq('id', validated.receipt_id)
        .single();

      const { data: invoice } = await supabase
        .from('vendor_invoices')
        .select('id, total_amount')
        .eq('id', validated.invoice_id)
        .single();

      if (!po || !receipt || !invoice) {
        return NextResponse.json({ error: 'One or more documents not found' }, { status: 404 });
      }

      // Create match record
      const { data: match, error } = await supabase
        .from('three_way_matches')
        .insert({
          purchase_order_id: validated.purchase_order_id,
          receipt_id: validated.receipt_id,
          invoice_id: validated.invoice_id,
          po_amount: po.total_amount,
          invoice_amount: invoice.total_amount,
          variance: Math.abs(po.total_amount - invoice.total_amount),
          status: Math.abs(po.total_amount - invoice.total_amount) < 0.01 ? 'matched' : 'variance',
          matched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice status if matched
      if (match.status === 'matched') {
        await supabase
          .from('vendor_invoices')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', validated.invoice_id);
      }

      return NextResponse.json({ match }, { status: 201 });
    }

    if (action === 'acknowledge_po') {
      // Vendor acknowledges PO
      const { po_id, acknowledged_by, expected_delivery, notes } = body.data;

      const { data: po, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by,
          expected_delivery,
          acknowledgment_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', po_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ purchase_order: po });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('PO receiving error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update receipt
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: receipt, error } = await supabase
      .from('po_receipts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ receipt });
  } catch (error: any) {
    console.error('PO receiving error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
