import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  payment_method: z.enum(['check', 'ach', 'wire', 'credit_card', 'cash']),
  payment_date: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const invoiceId = params.id;

    // Parse request body
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Check if invoice exists
    const { data: invoice, error: invoiceError } = await supabase
      .from('vendor_invoices')
      .select('id, status, total_amount, amount_paid, organization_id')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid in full' },
        { status: 400 }
      );
    }

    const remainingBalance = invoice.total_amount - (invoice.amount_paid || 0);
    if (validatedData.amount > remainingBalance) {
      return NextResponse.json(
        { error: `Payment amount exceeds remaining balance of ${remainingBalance}` },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('vendor_payments')
      .insert({
        vendor_invoice_id: invoiceId,
        organization_id: invoice.organization_id,
        amount: validatedData.amount,
        payment_method: validatedData.payment_method,
        payment_date: validatedData.payment_date || new Date().toISOString(),
        reference_number: validatedData.reference_number || null,
        notes: validatedData.notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json(
        { error: 'Failed to record payment' },
        { status: 500 }
      );
    }

    // Update invoice amount_paid and status
    const newAmountPaid = (invoice.amount_paid || 0) + validatedData.amount;
    const newStatus = newAmountPaid >= invoice.total_amount ? 'paid' : 'partial';

    const { data: updatedInvoice, error: updateError } = await supabase
      .from('vendor_invoices')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      invoice: updatedInvoice,
      message: newStatus === 'paid' ? 'Invoice paid in full' : 'Partial payment recorded',
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
