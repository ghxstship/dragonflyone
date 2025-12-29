import { withAuth, PlatformRole } from '@ghxstship/config';
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

interface VendorInvoice {
  id: string;
  organization_id: string;
  vendor_profile_id: string;
  purchase_order_id: string | null;
  vendor_order_id: string | null;
  invoice_number: string;
  vendor_invoice_number: string | null;
  invoice_date: string;
  due_date: string;
  payment_terms: string | null;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    category?: string;
  }>;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  amount_due: number;
  notes: string | null;
  status: string;
  payment_status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendor?: { id: string; name: string; logo_url: string | null };
  purchase_order?: { id: string; po_number: string } | null;
  vendor_order?: { id: string; order_number: string } | null;
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    let query = supabase
      .from('vendor_invoices')
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

    (invoices as VendorInvoice[])?.forEach((invoice) => {
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Get organization from platform_users table
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Generate invoice number
    const { data: invoiceCount } = await supabase
      .from('vendor_invoices')
      .select('id', { count: 'exact' })
      .eq('organization_id', platformUser.organization_id);

    const year = new Date().getFullYear().toString().slice(-2);
    const nextNum = ((invoiceCount?.length || 0) + 1).toString().padStart(5, '0');
    const invoiceNumber = `VINV${year}${nextNum}`;

    const { data: invoice, error } = await supabase
      .from('vendor_invoices')
      .insert({
        organization_id: platformUser.organization_id,
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
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
