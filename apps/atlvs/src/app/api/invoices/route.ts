import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const invoiceSchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  quote_id: z.string().uuid().optional(),
  contract_id: z.string().uuid().optional(),
  due_date: z.string(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  billing_address: z.string().optional(),
  po_number: z.string().optional(),
});

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number(),
  tax_rate: z.number().default(0),
  discount_amount: z.number().default(0),
});

// GET /api/invoices - List all invoices
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');
    const projectId = searchParams.get('project_id');
    const overdue = searchParams.get('overdue') === 'true';

    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email),
        project:projects(id, name, project_code),
        payments:invoice_payments(id, amount, payment_date, payment_method)
      `)
      .order('issue_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (overdue) {
      query = query
        .in('status', ['sent', 'viewed', 'partial'])
        .lt('due_date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices', details: error.message },
        { status: 500 }
      );
    }

    interface InvoiceRecord {
      id: string;
      status: string;
      total_amount: number;
      amount_paid: number;
      amount_due: number;
      due_date: string;
      [key: string]: unknown;
    }
    const invoices = (data || []) as unknown as InvoiceRecord[];

    const now = new Date();
    const summary = {
      total: invoices.length,
      by_status: {
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        viewed: invoices.filter(i => i.status === 'viewed').length,
        partial: invoices.filter(i => i.status === 'partial').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        cancelled: invoices.filter(i => i.status === 'cancelled').length,
      },
      total_invoiced: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
      total_paid: invoices.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
      total_outstanding: invoices
        .filter(i => ['sent', 'viewed', 'partial', 'overdue'].includes(i.status))
        .reduce((sum, i) => sum + (i.amount_due || 0), 0),
      overdue_amount: invoices
        .filter(i => new Date(i.due_date) < now && ['sent', 'viewed', 'partial'].includes(i.status))
        .reduce((sum, i) => sum + (i.amount_due || 0), 0),
    };

    return NextResponse.json({ invoices: data, summary });
  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = invoiceSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number', {
      org_id: organizationId,
    });

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        organization_id: organizationId,
        client_id: validated.client_id,
        project_id: validated.project_id,
        quote_id: validated.quote_id,
        contract_id: validated.contract_id,
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: validated.due_date,
        payment_terms: validated.payment_terms,
        notes: validated.notes,
        internal_notes: validated.internal_notes,
        billing_address: validated.billing_address,
        client_po_number: validated.po_number,
        created_by: userId,
      })
      .select(`*, client:clients(id, name, email)`)
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice', details: invoiceError.message },
        { status: 500 }
      );
    }

    // Add line items if provided
    if (body.line_items && Array.isArray(body.line_items) && body.line_items.length > 0) {
      const validatedItems = body.line_items.map((item: unknown) => lineItemSchema.parse(item));
      
      let subtotal = 0;
      let totalTax = 0;
      let totalDiscount = 0;

      const lineItemsToInsert = validatedItems.map((item: z.infer<typeof lineItemSchema>, index: number) => {
        const lineAmount = item.quantity * item.unit_price;
        const lineTax = lineAmount * (item.tax_rate || 0) / 100;
        const lineTotal = lineAmount - (item.discount_amount || 0) + lineTax;
        
        subtotal += lineAmount;
        totalTax += lineTax;
        totalDiscount += item.discount_amount || 0;

        return {
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: lineAmount,
          tax_rate: item.tax_rate,
          tax_amount: lineTax,
          discount_amount: item.discount_amount,
          line_total: lineTotal,
          sort_order: index,
        };
      });

      await supabase.from('invoice_line_items').insert(lineItemsToInsert);

      // Update invoice totals
      const totalAmount = subtotal - totalDiscount + totalTax;
      await supabase
        .from('invoices')
        .update({
          subtotal,
          tax_amount: totalTax,
          discount_amount: totalDiscount,
          total_amount: totalAmount,
          amount_due: totalAmount,
        })
        .eq('id', invoice.id);
    }

    // Log activity
    await supabase.from('invoice_activity_log').insert({
      invoice_id: invoice.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Invoice created',
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
