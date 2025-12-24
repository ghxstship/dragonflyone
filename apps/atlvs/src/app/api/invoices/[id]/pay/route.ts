export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const paymentSchema = z.object({
  payment_method_id: z.string().optional(),
  amount: z.number().positive(),
  payment_type: z.enum(['card', 'ach', 'check', 'cash', 'other']).default('card'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: invoiceId } = await params;

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, total_amount, status, amount_paid')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    const body = await request.json();
    const validationResult = paymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { amount, payment_type, notes } = validationResult.data;
    const newAmountPaid = (invoice.amount_paid || 0) + amount;
    const remaining = invoice.total_amount - newAmountPaid;

    const { data: payment, error: paymentError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_type,
        notes,
        status: 'completed',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      logger.error('Error recording payment:', paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    const newStatus = remaining <= 0 ? 'paid' : 'partially_paid';

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        status: newStatus, 
        amount_paid: newAmountPaid,
        paid_at: remaining <= 0 ? new Date().toISOString() : null,
      })
      .eq('id', invoiceId);

    if (updateError) {
      logger.error('Error updating invoice:', updateError);
    }

    return NextResponse.json({ 
      data: payment,
      invoice_status: newStatus,
      amount_remaining: Math.max(0, remaining),
    }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/invoices/[id]/pay:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
