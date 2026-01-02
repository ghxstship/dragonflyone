export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const invoiceSchema = z.object({
  invoice_type: z.string().optional(),
  bill_to_org_id: z.string().uuid().optional(),
  bill_to_person_id: z.string().uuid().optional(),
  issue_date: z.string().datetime(),
  due_date: z.string().datetime().optional(),
  payment_terms: z.string().default('net_30'),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
  })).min(1),
  notes: z.string().optional(),
});

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const billToOrgId = searchParams.get('bill_to_org_id');
    const statusFilter = searchParams.get('status');
    const overdue = searchParams.get('overdue') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('docs_profile_invoice')
      .select(`
        *,
        document:legend_documents(id, title, status, created_at),
        bill_to_org:legend_organizations(id, name),
        bill_to_person:legend_people(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('issue_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (billToOrgId) {
      query = query.eq('bill_to_org_id', billToOrgId);
    }
    if (statusFilter) {
      query = query.eq('collection_status', statusFilter);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          invoices: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, paid: 0, unpaid: 0, overdue: 0, total_amount: 0, outstanding_amount: 0 }
        });
      }
      logger.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    let invoices = data || [];
    const now = new Date();

    // Filter overdue if requested
    if (overdue) {
      invoices = invoices.filter(inv => {
        if (!inv.due_date) return false;
        return new Date(inv.due_date) < now && (inv.amount_due || 0) > 0;
      });
    }

    const allInvoices = data || [];
    const summary = {
      total: count || 0,
      paid: allInvoices.filter(i => (i.amount_due || 0) === 0).length,
      unpaid: allInvoices.filter(i => (i.amount_due || 0) > 0).length,
      overdue: allInvoices.filter(i => {
        if (!i.due_date) return false;
        return new Date(i.due_date) < now && (i.amount_due || 0) > 0;
      }).length,
      total_amount: allInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
      outstanding_amount: allInvoices.reduce((sum, i) => sum + (i.amount_due || 0), 0),
    };

    return NextResponse.json({ invoices, total: invoices.length, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/invoices:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create invoice
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = invoiceSchema.parse(body);

    // Calculate totals
    const subtotal = validated.line_items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0);
    const taxRate = body.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // First create the document
    const { data: document, error: docError } = await supabase
      .from('legend_documents')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        title: `Invoice ${invoiceNumber}`,
        document_type: 'invoice',
        status: 'draft',
        created_by: authResult.user?.id,
      })
      .select()
      .single();

    if (docError) {
      logger.error('Error creating document:', docError);
      return NextResponse.json({ error: 'Failed to create invoice document' }, { status: 500 });
    }

    // Then create the invoice profile
    const { data: invoice, error } = await supabase
      .from('docs_profile_invoice')
      .insert({
        document_id: document.id,
        invoice_type: validated.invoice_type,
        invoice_number: invoiceNumber,
        bill_to_org_id: validated.bill_to_org_id,
        bill_to_person_id: validated.bill_to_person_id,
        issue_date: validated.issue_date,
        due_date: validated.due_date,
        payment_terms: validated.payment_terms,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        amount_due: totalAmount,
        line_items: validated.line_items,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating invoice:', error);
      return NextResponse.json({ error: 'Failed to create invoice', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice: { ...invoice, document } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/invoices:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/invoices - Update invoice or record payment
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { invoice_id, updates, action, payment_amount } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    if (action === 'record_payment') {
      // Get current invoice
      const { data: current } = await supabase
        .from('docs_profile_invoice')
        .select('amount_paid, amount_due, total_amount')
        .eq('id', invoice_id)
        .single();

      if (!current) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const newAmountPaid = (current.amount_paid || 0) + payment_amount;
      const newAmountDue = current.total_amount - newAmountPaid;

      const { data: invoice, error } = await supabase
        .from('docs_profile_invoice')
        .update({
          amount_paid: newAmountPaid,
          amount_due: Math.max(0, newAmountDue),
          paid_date: newAmountDue <= 0 ? new Date().toISOString() : null,
          paid_amount: newAmountDue <= 0 ? current.total_amount : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
      }

      return NextResponse.json({ success: true, invoice, message: 'Payment recorded' });
    }

    if (action === 'send') {
      // Mark as sent
      const { data: invoice, error } = await supabase
        .from('docs_profile_invoice')
        .update({
          collection_status: 'sent',
          reminder_sent_count: 1,
          last_reminder_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
      }

      return NextResponse.json({ success: true, invoice, message: 'Invoice sent' });
    }

    if (updates) {
      const { data: invoice, error } = await supabase
        .from('docs_profile_invoice')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', invoice_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
      }

      return NextResponse.json({ success: true, invoice });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/invoices:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices - Void/delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    // Get document_id first
    const { data: invoice } = await supabase
      .from('docs_profile_invoice')
      .select('document_id, amount_paid')
      .eq('id', invoiceId)
      .single();

    if (invoice?.amount_paid && invoice.amount_paid > 0) {
      return NextResponse.json({ error: 'Cannot delete invoice with payments. Void instead.' }, { status: 400 });
    }

    // Delete invoice profile
    await supabase
      .from('docs_profile_invoice')
      .delete()
      .eq('id', invoiceId);

    // Delete document
    if (invoice?.document_id) {
      await supabase
        .from('legend_documents')
        .delete()
        .eq('id', invoice.document_id);
    }

    return NextResponse.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/invoices:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
