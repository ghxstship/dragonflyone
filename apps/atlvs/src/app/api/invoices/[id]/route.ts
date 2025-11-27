import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email, phone, billing_address),
        project:projects(id, name, project_code),
        line_items:invoice_line_items(*),
        payments:invoice_payments(*),
        quote:quotes(id, quote_number),
        contract:contracts(id, contract_number)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch invoice', details: error.message },
        { status: 500 }
      );
    }

    // Fetch activity history
    const { data: history } = await supabase
      .from('invoice_activity_log')
      .select(`*, user:platform_users(id, full_name)`)
      .eq('invoice_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ ...invoice, history: history || [] });
  } catch (error) {
    console.error('Error in GET /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;
    const body = await request.json();
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!['draft'].includes(existingInvoice.status)) {
      return NextResponse.json(
        { error: `Cannot edit invoice in ${existingInvoice.status} status` },
        { status: 400 }
      );
    }

    const { user_id, line_items, ...updates } = body;

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update invoice', details: updateError.message },
        { status: 500 }
      );
    }

    await supabase.from('invoice_activity_log').insert({
      invoice_id: id,
      activity_type: 'updated',
      user_id: userId,
      description: 'Invoice updated',
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error in PUT /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/invoices/[id] - Actions (send, void, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    switch (action) {
      case 'send': {
        if (invoice.status !== 'draft') {
          return NextResponse.json(
            { error: 'Only draft invoices can be sent' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_count: (invoice.sent_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to send invoice', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('invoice_activity_log').insert({
          invoice_id: id,
          activity_type: 'sent',
          user_id: userId,
          description: 'Invoice sent to client',
        });

        // Create ledger entry for accounts receivable
        await supabase.from('ledger_entries').insert({
          organization_id: invoice.organization_id,
          account_code: '1200',
          entry_type: 'debit',
          amount: invoice.total_amount,
          description: `Invoice ${invoice.invoice_number}`,
          reference_type: 'invoice',
          reference_id: id,
          entry_date: new Date().toISOString().split('T')[0],
          created_by: userId,
          client_id: invoice.client_id,
        });

        return NextResponse.json({ success: true, message: 'Invoice sent' });
      }

      case 'void': {
        if (['paid', 'cancelled', 'voided'].includes(invoice.status)) {
          return NextResponse.json(
            { error: `Cannot void invoice in ${invoice.status} status` },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'voided',
            voided_at: new Date().toISOString(),
            voided_by: userId,
            void_reason: body.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to void invoice', details: error.message },
            { status: 500 }
          );
        }

        await supabase.from('invoice_activity_log').insert({
          invoice_id: id,
          activity_type: 'voided',
          user_id: userId,
          description: `Invoice voided: ${body.reason || 'No reason provided'}`,
        });

        return NextResponse.json({ success: true, message: 'Invoice voided' });
      }

      case 'record_payment': {
        const paymentSchema = z.object({
          amount: z.number().positive(),
          payment_date: z.string(),
          payment_method: z.enum(['cash', 'check', 'credit_card', 'ach', 'wire', 'other']),
          reference_number: z.string().optional(),
          notes: z.string().optional(),
        });

        const payment = paymentSchema.parse(body.payment);

        // Create payment record
        const { data: paymentRecord, error: paymentError } = await supabase
          .from('invoice_payments')
          .insert({
            invoice_id: id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method,
            reference_number: payment.reference_number,
            notes: payment.notes,
            recorded_by: userId,
          })
          .select()
          .single();

        if (paymentError) {
          return NextResponse.json(
            { error: 'Failed to record payment', details: paymentError.message },
            { status: 500 }
          );
        }

        // Update invoice amounts
        const newAmountPaid = (invoice.amount_paid || 0) + payment.amount;
        const newAmountDue = invoice.total_amount - newAmountPaid;
        const newStatus = newAmountDue <= 0 ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newAmountPaid,
            amount_due: Math.max(0, newAmountDue),
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        // Create ledger entries
        await supabase.from('ledger_entries').insert([
          {
            organization_id: invoice.organization_id,
            account_code: '1000',
            entry_type: 'debit',
            amount: payment.amount,
            description: `Payment for Invoice ${invoice.invoice_number}`,
            reference_type: 'payment',
            reference_id: paymentRecord.id,
            entry_date: payment.payment_date,
            created_by: userId,
          },
          {
            organization_id: invoice.organization_id,
            account_code: '1200',
            entry_type: 'credit',
            amount: payment.amount,
            description: `Payment for Invoice ${invoice.invoice_number}`,
            reference_type: 'payment',
            reference_id: paymentRecord.id,
            entry_date: payment.payment_date,
            created_by: userId,
            client_id: invoice.client_id,
          },
        ]);

        await supabase.from('invoice_activity_log').insert({
          invoice_id: id,
          activity_type: 'payment_received',
          user_id: userId,
          description: `Payment of $${payment.amount} received via ${payment.payment_method}`,
        });

        return NextResponse.json({
          success: true,
          message: 'Payment recorded',
          payment: paymentRecord,
          new_status: newStatus,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in PATCH /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, invoice_number')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }

    await supabase.from('invoice_line_items').delete().eq('invoice_id', id);
    await supabase.from('invoice_activity_log').delete().eq('invoice_id', id);
    
    const { error: deleteError } = await supabase.from('invoices').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete invoice', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoice.invoice_number} deleted`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/invoices/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
