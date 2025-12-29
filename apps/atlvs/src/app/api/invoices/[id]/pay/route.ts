export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const paymentSchema = z.object({
  payment_method_id: z.string().optional(),
  amount: z.number().positive(),
  payment_type: z.enum(['card', 'ach', 'check', 'cash', 'other']).default('card'),
  notes: z.string().optional(),
});

export const POST = apiRoute(
  async (request: NextRequest, context) => {
    const supabase = createAdminClient();
    const { id: invoiceId } = await context.params!;

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
    const remaining = (invoice.total_amount || 0) - newAmountPaid;

    const { data: payment, error: paymentError } = await supabase
      .from('invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_method: payment_type,
        notes,
        status: 'completed',
        payment_date: new Date().toISOString(),
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
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_SUPER_ADMIN],
    validation: paymentSchema,
    audit: { action: 'invoice:pay', resource: 'invoices' },
  }
);
