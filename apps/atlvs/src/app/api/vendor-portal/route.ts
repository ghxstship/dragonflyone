export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Vendor invoice portal for self-service
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Get vendor linked to user
    const { data: vendor } = await supabase.from('vendors').select('id')
      .eq('portal_user_id', user.id).single();

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    // Get POs with pagination
    const { data: purchaseOrders, count: poCount } = await supabase
      .from('purchase_orders')
      .select('id, po_number, status, total_amount, created_at', { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get invoices with pagination
    const { data: invoices, count: invCount } = await supabase
      .from('vendor_invoices')
      .select('id, invoice_number, amount, status, submitted_at, due_date', { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get payments with pagination
    const { data: payments, count: payCount } = await supabase
      .from('vendor_payments')
      .select('id, amount, payment_date, payment_method, status', { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const pagination = {
      page,
      limit,
      purchase_orders_total: poCount || 0,
      invoices_total: invCount || 0,
      payments_total: payCount || 0,
    };

    return NextResponse.json({
      purchase_orders: purchaseOrders,
      invoices,
      payments,
      summary: {
        open_pos: purchaseOrders?.filter(po => po.status === 'open').length || 0,
        pending_invoices: invoices?.filter(i => i.status === 'pending').length || 0,
        total_outstanding: invoices?.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0) || 0
      },
      pagination,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: vendor } = await supabase.from('vendors').select('id')
      .eq('portal_user_id', user.id).single();

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const body = await request.json();
    const { action } = body;

    if (action === 'submit_invoice') {
      const { po_id, invoice_number, amount, invoice_date, due_date, document_url, line_items } = body;

      const { data, error } = await supabase.from('vendor_invoices').insert({
        vendor_id: vendor.id, po_id, invoice_number, amount,
        invoice_date, due_date, document_url, line_items: line_items || [],
        status: 'pending', submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ invoice: data }, { status: 201 });
    }

    if (action === 'acknowledge_po') {
      const { po_id, estimated_delivery_date, notes } = body;

      await supabase.from('purchase_orders').update({
        vendor_acknowledged: true, acknowledged_at: new Date().toISOString(),
        estimated_delivery_date, vendor_notes: notes
      }).eq('id', po_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
