/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  vendor_profile_id: z.string().uuid(),
  purchase_order_id: z.string().uuid().optional(),
  vendor_order_id: z.string().uuid().optional(),
  vendor_invoice_number: z.string().optional(),
  invoice_date: z.string(),
  due_date: z.string(),
  payment_terms: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
    category: z.string().optional(),
  })),
  subtotal: z.number(),
  tax_amount: z.number().optional(),
  discount_amount: z.number().optional(),
  shipping_amount: z.number().optional(),
  total: z.number(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const dueBefore = searchParams.get('due_before');
    const dueAfter = searchParams.get('due_after');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase
      .from('vendor_invoices') as any)
      .select(`
        *,
        vendor:vendor_profiles(id, name, logo_url),
        purchase_order:purchase_orders(id, po_number),
        vendor_order:vendor_orders(id, order_number)
      `)
      .order('due_date', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (vendorId) {
      query = query.eq('vendor_profile_id', vendorId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (dueBefore) {
      query = query.lte('due_date', dueBefore);
    }

    if (dueAfter) {
      query = query.gte('due_date', dueAfter);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Error fetching vendor invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    // Calculate aging buckets
    const today = new Date();
    const aging = {
      current: 0,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      over_90: 0,
      total_outstanding: 0,
    };

    (invoices as any[])?.forEach((invoice) => {
      if (invoice.payment_status !== 'paid') {
        const dueDate = new Date(invoice.due_date);
        const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const amountDue = invoice.amount_due || 0;

        if (daysPastDue <= 0) {
          aging.current += amountDue;
        } else if (daysPastDue <= 30) {
          aging.days_1_30 += amountDue;
        } else if (daysPastDue <= 60) {
          aging.days_31_60 += amountDue;
        } else if (daysPastDue <= 90) {
          aging.days_61_90 += amountDue;
        } else {
          aging.over_90 += amountDue;
        }
        aging.total_outstanding += amountDue;
      }
    });

    return NextResponse.json({ invoices, aging });
  } catch (error) {
    console.error('Error in GET /api/vendor-invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Get organization from user's membership
    const { data: membership } = await (supabase
      .from('organization_members') as any)
      .select('organization_id')
      .eq('user_id', user.id)
      .single() as { data: { organization_id: string } | null };

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Generate invoice number
    const { data: invoiceCount } = await (supabase
      .from('vendor_invoices') as any)
      .select('id', { count: 'exact' })
      .eq('organization_id', membership.organization_id);

    const year = new Date().getFullYear().toString().slice(-2);
    const nextNum = ((invoiceCount?.length || 0) + 1).toString().padStart(5, '0');
    const invoiceNumber = `VINV${year}${nextNum}`;

    const { data: invoice, error } = await (supabase
      .from('vendor_invoices') as any)
      .insert({
        organization_id: membership.organization_id,
        vendor_profile_id: input.vendor_profile_id,
        purchase_order_id: input.purchase_order_id,
        vendor_order_id: input.vendor_order_id,
        invoice_number: invoiceNumber,
        vendor_invoice_number: input.vendor_invoice_number,
        invoice_date: input.invoice_date,
        due_date: input.due_date,
        payment_terms: input.payment_terms,
        line_items: input.line_items,
        subtotal: input.subtotal,
        tax_amount: input.tax_amount || 0,
        discount_amount: input.discount_amount || 0,
        shipping_amount: input.shipping_amount || 0,
        total: input.total,
        notes: input.notes,
        status: 'pending',
        payment_status: 'unpaid',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor invoice:', error);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vendor-invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
