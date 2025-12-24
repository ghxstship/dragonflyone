export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const confirmSchema = z.object({
  payment_intent_id: z.string().uuid(),
  payment_method_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = confirmSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { payment_intent_id, payment_method_id } = validationResult.data;

    const { data: intent, error: fetchError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('id', payment_intent_id)
      .single();

    if (fetchError || !intent) {
      return NextResponse.json({ error: 'Payment intent not found' }, { status: 404 });
    }

    if (intent.status === 'succeeded') {
      return NextResponse.json({ error: 'Payment already confirmed' }, { status: 400 });
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_intent_id,
        payment_method_id,
        amount: intent.amount,
        currency: intent.currency,
        status: 'succeeded',
        invoice_id: intent.invoice_id,
        booking_id: intent.booking_id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      logger.error('Error creating transaction:', transactionError);
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    await supabase
      .from('payment_intents')
      .update({ status: 'succeeded', confirmed_at: new Date().toISOString() })
      .eq('id', payment_intent_id);

    if (intent.invoice_id) {
      await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', intent.invoice_id);
    }

    return NextResponse.json({ 
      data: transaction,
      status: 'succeeded',
    });
  } catch (error) {
    logger.error('Error in POST /api/payments/confirm:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
